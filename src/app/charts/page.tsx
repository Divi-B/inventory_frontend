"use client";

import React, { useState, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Box,
    Typography,
    SelectChangeEvent,
    RadioGroup,
    Radio,
    FormControlLabel,
} from '@mui/material';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { ChartData } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { indigo } from 'tailwindcss/colors';
import { useDataStore } from '../store/dataStore';


const BarChart = dynamic(() => import('./visuals/BarChart'), { ssr: false });
const PieChart = dynamic(() => import('./visuals/PieChart'), { ssr: false });


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


interface PredictionFactorsResponse {
    prediction_factors: string[];
}

interface FeaturesResponse {
    features: string[];
}

interface FullPredictionResponse {
    predictions: Record<string, any>[];
    predicted_column: string;
}

interface ChartDataForFeature {
    [key: string]: ChartData<'bar'>;
}

interface DatasetPreview {
    columns: string[];
    data: Record<string, any>[];
}

interface DataState {
    uploadedFile: File | null;
    uploadedFullData: Record<string, any>[] | null;
    previewData: DatasetPreview | null;
    setUploadedFile: (file: File | null) => void;
    setUploadedFullData: (data: Record<string, any>[] | null) => void;
    setPreviewData: (data: DatasetPreview | null) => void;
}

// export const useDataStore = create<DataState>()(
//     persist(
//         (set) => ({
//             uploadedFile: null,
//             uploadedFullData: null,
//             previewData: null,
//             setUploadedFile: (file) => set({ uploadedFile: file }),
//             setUploadedFullData: (data) => set({ uploadedFullData: data }),
//             setPreviewData: (data) => set({ previewData: data }),
//         }),
//         {
//             name: 'market-analysis-data',
//             storage: createJSONStorage(() => localStorage),
//         }
//     )
// );


const Charts: React.FC = () => {
    const {
        uploadedFile,
        uploadedFullData,
        previewData,
        setUploadedFile,
        setUploadedFullData,
        setPreviewData,
    } = useDataStore();

    const [predictionFactor, setPredictionFactor] = useState<string | null>(null);
    const [featuresToCompare, setFeaturesToCompare] = useState<string[]>([]);
    const [predictionResults, setPredictionResults] = useState<Record<string, any>[] | null>(null);
    const [predictedColumnName, setPredictedColumnName] = useState<string | null>(null);
    const [predictionError, setPredictionError] = useState<string | null>(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [availablePredictionFactors, setAvailablePredictionFactors] = useState<string[]>([]);
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
    const [chartDataForFeatures, setChartDataForFeatures] = useState<ChartDataForFeature>({});
    const [availableFeaturesForPrediction, setAvailableFeaturesForPrediction] = useState<string[]>([]);
    const [selectedPieChartFeature, setSelectedPieChartFeature] = useState<string | null>(null);
    const [pieChartData, setPieChartData] = useState<ChartData<'pie'> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const barChartRefs = useRef<Record<string, any>>({});
    const pieChartRef = useRef<any>(null);

    useEffect(() => {
        const fetchPredictionFactors = async () => {
            try {
                const response = await axios.get<PredictionFactorsResponse>(`${API_URL}/prediction-factors`);
                console.log('Factors fetched:', response.data);
                setAvailablePredictionFactors(response.data.prediction_factors);
            } catch (error: any) {
                console.error('Error fetching prediction factors:', error);
                setPredictionError('Failed to load prediction factors.');
            }
        };
        fetchPredictionFactors();
    }, []);

    const handlePredictionFactorChange = async (event: SelectChangeEvent<string | null>) => {
        const selectedFactor = event.target.value;
        setPredictionFactor(selectedFactor);
        setAvailableFeaturesForPrediction([]);
        setFeaturesToCompare([]); 

        if (selectedFactor) {
            try {
                const response = await axios.get<FeaturesResponse>(`${API_URL}/features/${selectedFactor}`);
                setAvailableFeaturesForPrediction(response.data.features);
            } catch (error: any) {
                console.error(`Error fetching features for ${selectedFactor}:`, error);
                setPredictionError(`Failed to load features for ${selectedFactor}.`);
            }
        }
        setChartDataForFeatures({}); 
        setPredictionResults(null);
        setPredictedColumnName(null);
    };

    const handleFeaturesToCompareChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        setFeaturesToCompare(typeof value === 'string' ? value.split(',') : value);
        setSelectedPieChartFeature(null); 
        setPieChartData(null);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setUploadedFile(file);

                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target?.result as string;
                    const lines = text.split('\n');
                    if (lines.length > 0) {
                        const columns = lines[0].split(',');
                        const data = lines.slice(1).map((line) => {
                            const values = line.split(',');
                            const row: Record<string, any> = {};
                            columns.forEach((col, index) => {
                                row[col] = values[index];
                            });
                            return row;
                        });
                        
                        let hasNonNumeric = false;
                        for (let i = 0; i < Math.min(10, data.length); i++) {
                            for (const key in data[i]) {
                                if (isNaN(Number(data[i][key]))) {
                                    hasNonNumeric = true;
                                    break;
                                }
                            }
                            if (hasNonNumeric) break;
                        }

                        if (hasNonNumeric) {
                            setPredictionError(
                                'Error: The dataset contains non-numerical values. Please ensure that all data is numeric.'
                            );
                            setUploadedFullData(null); 
                            setPreviewData(null);
                            return; 
                        }
                        setPreviewData({
                            columns, data: data.slice(0, 5),
                            predictions: [],
                            summary: '',
                            full_data: []
                        });
                        setUploadedFullData(data);
                        setPredictionResults(null); 
                        setPredictedColumnName(null);
                        setChartDataForFeatures({}); 
                        setSelectedPieChartFeature(null);
                        setPieChartData(null);
                    }
                };
                reader.readAsText(file);
            } else {
                setPredictionError('Please upload a valid CSV file.');
                setUploadedFile(null);
                setUploadedFullData(null);
                setPreviewData(null);
                setPredictionResults(null);
                setPredictedColumnName(null);
                setChartDataForFeatures({});
                setSelectedPieChartFeature(null);
                setPieChartData(null);
            }
        }
    };


    const handleChooseFileClick = () => {
        fileInputRef.current?.click();
    };

    const handlePredictAndVisualize = async () => {
        if (!uploadedFile || !predictionFactor) {
            console.error('No file or prediction factor selected.');
            setPredictionError('Please upload a file and select a prediction factor.');
            return;
        }

        setIsPredicting(true);
        setPredictionError(null);
        setChartDataForFeatures({}); 
        setSelectedPieChartFeature(null);
        setPieChartData(null);

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile, uploadedFile.name || 'uploaded_data.csv');
            formData.append('prediction_factor', predictionFactor);

            const response = await axios.post<FullPredictionResponse>(`${API_URL}/predict`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setPredictionResults(response.data.predictions);
            setPredictedColumnName(response.data.predicted_column);
        } catch (error: any) {
            console.error('Prediction failed:', error);
            let errorMessage = 'Prediction failed: '; 
            if (error.response) {
                errorMessage += `${error.response.status} - ${error.response.data?.detail || error.response.statusText}`;
            } else if (error.request) {
                errorMessage += 'No response from server.';
            } else {
                errorMessage += error.message;
            }
            setPredictionError(errorMessage);
        } finally {
            setIsPredicting(false);
        }
    };

    const getChartAsImageDataUrl = (chartInstance: any): string | null => {
        if (chartInstance && chartInstance.canvas) {
            return chartInstance.canvas.toDataURL('image/png');
        }
        return null;
    };

    const downloadChartsAsPdf = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        let yOffset = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const chartWidth = pageWidth - 40;
        const chartHeight = 100;
    

        for (const feature in chartDataForFeatures) {
            const chartElement = barChartRefs.current[feature]?.containerRef?.current;
            if (chartElement) {
                const canvas = await html2canvas(chartElement);
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 20, yOffset, chartWidth, chartHeight);
                yOffset += chartHeight + 10;
                if (yOffset > pdf.internal.pageSize.getHeight() - 20) {
                    pdf.addPage();
                    yOffset = 20;
                }
            }
        }
    
        if (pieChartRef.current?.containerRef?.current) {
            const canvas = await html2canvas(pieChartRef.current.containerRef.current);
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 20, yOffset, chartWidth / 2, chartHeight / 2);
        }
    
        pdf.save('charts.pdf');
    };

    useEffect(() => {
        if (predictionResults && predictedColumnName && featuresToCompare.length > 0 && chartType === 'bar') {
            const newChartData: ChartDataForFeature = {};
            featuresToCompare.forEach((feature) => {
                if (predictionResults[0]?.[feature]) {
                    const labels = predictionResults.map((item) => String(item[predictedColumnName]));
                    const data = predictionResults.map((item) => {
                        const val = item[feature];
                        return typeof val === 'number' && !isNaN(val) ? val : 0;
                    });
                    newChartData[feature] = {
                        labels: labels,
                        datasets: [
                            {
                                label: feature,
                                data: data,
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                            },
                        ],
                    };
                }
            });
            setChartDataForFeatures(newChartData);
            setPieChartData(null);
            setSelectedPieChartFeature(null);
        }
    }, [predictionResults, predictedColumnName, featuresToCompare, chartType]);

    useEffect(() => {
        if (predictionResults && predictedColumnName && selectedPieChartFeature && chartType === 'pie') {
            const featureData = predictionResults
                .map((item) => item[selectedPieChartFeature])
                .filter((value) => value !== undefined && value !== null);
            const valueCounts: Record<string, number> = {};
            featureData.forEach((value) => {
                valueCounts[String(value)] = (valueCounts[String(value)] || 0) + 1;
            });

            const labels = Object.keys(valueCounts);
            const data = Object.values(valueCounts);
            const backgroundColor = [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)',
            ];

            setPieChartData({
                labels: labels,
                datasets: [
                    {
                        label: selectedPieChartFeature,
                        data: data,
                        backgroundColor: backgroundColor.slice(0 , labels.length),
                    },
                ],
            });
            setChartDataForFeatures({});
        } else if (chartType === 'pie') {
            setChartDataForFeatures({});
        }
    }, [predictionResults, selectedPieChartFeature, chartType]);

    const availableColumns = previewData?.columns || [];

    return (
        <Box className="p-8 min-h-screen rounded-md bg-indigo-50 dark:bg-indigo-500">
            <Typography variant="h5" gutterBottom>
                Data Visualization
            </Typography>

            {predictionError && <Typography color="error" mb={2}>{predictionError}</Typography>}

            <FormControl fullWidth margin="normal">
                <InputLabel id="prediction-factor-label">Select Prediction Factor</InputLabel>
                <Select
                    labelId="prediction-factor-label"
                    value={predictionFactor || ''}
                    onChange={handlePredictionFactorChange}
                    label="Select Prediction Factor"
                >
                    {availablePredictionFactors.map((factor) => (
                        <MenuItem key={factor} value={factor}>
                            {factor}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {chartType === 'bar' && (
                <FormControl fullWidth margin="normal">
                    <InputLabel id="features-to-compare-label">Select features to compare with prediction</InputLabel>
                    <Select
                        labelId="features-to-compare-label"
                        multiple
                        value={featuresToCompare}
                        onChange={handleFeaturesToCompareChange}
                        renderValue={(selected) => selected.join(', ')}
                        label="Select features to compare with prediction"
                    >
                        {availableFeaturesForPrediction.map((feature) => (
                            <MenuItem key={feature} value={feature}>
                                {feature}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {chartType === 'pie' && (
                <FormControl fullWidth margin="normal">
                    <InputLabel id="pie-chart-feature-label">Select feature for Pie Chart</InputLabel>
                    <Select
                        labelId="pie-chart-feature-label"
                        value={selectedPieChartFeature || ''}
                        onChange={(e) => {
                            setSelectedPieChartFeature(e.target.value);
                            setFeaturesToCompare([]); 
                        }}
                        label="Select feature for Pie Chart"
                    >
                        {availableFeaturesForPrediction.map((feature) => (
                            <MenuItem key={feature} value={feature}>
                                {feature}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            <Box mt={2} display="flex" alignItems="center" gap={2}>
                <Button variant="outlined" onClick={handleChooseFileClick}>
                    Choose CSV File
                </Button>
                <input
                    type="file"
                    accept=".csv, text/csv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                />
                {uploadedFile && <Typography variant="body2">Uploaded: {uploadedFile.name}</Typography>}
                <Button
                    variant="contained"
                    onClick={handlePredictAndVisualize}
                    disabled={!uploadedFile || !predictionFactor || isPredicting}
                >
                    Predict
                </Button>
            </Box>

            <FormControl margin="normal">
                <Typography component="legend" variant="subtitle1">
                    Select Chart Type
                </Typography>
                <RadioGroup
                    aria-label="chart-type"
                    name="chart-type"
                    value={chartType}
                    onChange={(event) => {
                        setChartType(event.target.value as 'bar' | 'pie');
                        setChartDataForFeatures({});
                        setPieChartData(null);
                        setFeaturesToCompare([]);
                        setSelectedPieChartFeature(null);
                    }}
                    row
                >
                    <FormControlLabel value="bar" control={<Radio />} label="Bar Chart (Feature vs Prediction)" />
                    <FormControlLabel value="pie" control={<Radio />} label="Pie Chart (Distribution of a Feature)" />
                </RadioGroup>
            </FormControl>

            <Box mt={3}>
                {chartType === 'bar' &&
                    Object.keys(chartDataForFeatures).map((feature) => {
                        const chartData = chartDataForFeatures[feature];
                        return (
                            <Box key={feature} mb={3}>
                                <Typography variant="h6">
                                    {feature} vs {predictedColumnName}
                                </Typography>
                                <div style={{ width: '80%', height: '300px' }}>
                                <BarChart
                                    data={chartData as ChartData<'bar'>}
                                    containerRef={barChartRefs.current[feature]}
                                />

                                </div>
                            </Box>
                        );
                    })}

                {chartType === 'pie' && pieChartData && selectedPieChartFeature && (
                    <Box mb={5}>
                        <Typography variant="h6">Distribution of {selectedPieChartFeature}</Typography>
                        <div style={{ width: '50%', height: '300px', margin: '5px' }} ref={pieChartRef}>
                            <PieChart data={pieChartData} chartRef={pieChartRef} />
                        </div>
                    </Box>
                )}
            </Box>

            {(Object.keys(chartDataForFeatures).length > 0 || pieChartData) && (
                <Button variant="contained" color="primary" onClick={downloadChartsAsPdf} sx={{ mt: 3 }}>
                    Download Charts as PDF
                </Button>
            )}
        </Box>
    );
};

export default Charts;