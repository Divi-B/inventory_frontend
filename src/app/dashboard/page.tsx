"use client"

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PredictionForm from './PredictionForm';
import ReactMarkdown from 'react-markdown';
import FeatureImportanceChart from './FeatureImportance';
import DatasetUpload from './DataSetUpload';
import CorrelationHeatmap from '../charts/visuals/CorrelationHeatmap';
import { PredictionResult } from '../types';
import { DatasetPreview } from '../types';
import dynamic from 'next/dynamic';
import { Button, Typography, Box } from '@mui/material';
import { useDataStore } from '../store/dataStore';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Collapse, IconButton} from '@mui/material';
import Grid from '@mui/material/Grid'; 

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CorrelationHeatmapProps {
  data: number[][]; 
  xLabels: string[]; 
  yLabels: string[]; 
}

const BarChart = dynamic(() => import('../charts/visuals/BarChart'), { ssr: false });
const PieChart = dynamic(() => import('../charts/visuals/PieChart'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const dashboard: React.FC = () => {
  const {uploadedFullData,previewData, setUploadedFullData: storeSetUploadedFullData, setPreviewData: storeSetPreviewData } = useDataStore();
  const [selectedFactor, setSelectedFactor] = useState<string>('');
  const [features, setFeatures] = useState<string[]>([]);
  const [inputMethod, setInputMethod] = useState<'form' | 'upload'>('form');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][] | null>(null);
  const [correlationLabels, setCorrelationLabels] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [correlationError, setCorrelationError] = useState<string | null>(null);
  const [fullData, setFullData] = useState<PredictionResult[] | null>(null);
  const [fullPreviewData, setFullPreviewData] = useState<Record<string, any>[]>([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'pie' | null>(null);
  const [selectedChartFeatures, setSelectedChartFeatures] = useState<string[]>([]);
  const [chartData, setChartData] = useState<{ labels: string[]; datasets: { label: string; data: number[] }[] } | null>(null);
  const [importantFeatures, setImportantFeatures] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [predictionFactors, setPredictionFactors] = useState<string[]>([]);
  const [ setUploadedFullData] = useState<Record<string, any>[]>([]);


  useEffect(() => {
    if (previewData?.full_data) {
      setFullPreviewData(previewData.full_data);
    } else {
      setFullPreviewData([]);
    }
  }, [previewData]);
  useEffect(() => {
    const fetchPredictionFactors = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/prediction-factors`);
        setPredictionFactors(response.data.prediction_factors); 

        if (response.data.prediction_factors.length > 0) {
          setSelectedFactor(response.data.prediction_factors[0]);
        }
      } catch (err: any) {
        setError('Failed to fetch prediction factors');
        console.error('API error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictionFactors();
  }, []);
  
    useEffect(() => {
        const fetchFeatures = async () => {
            if (!selectedFactor) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${API_URL}/features/${selectedFactor}`);
                setFeatures(response.data.features);
            } catch (err: any) {
                setError('Failed to fetch features');
                console.error('API error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeatures();
    }, [selectedFactor]);

    const handleDataUploaded = async (fullData: Record<string, any>[]) => {
      if (!fullData || fullData.length === 0) {
        console.warn("No data received for upload.");
        return;
      }
      storeSetUploadedFullData(fullData);
      console.log("uploadedFullData set in store:", useDataStore.getState().uploadedFullData);
      setCorrelationMatrix(null);
      setCorrelationError(null);
      fetchCorrelation(fullData);
    }

    const handlePreviewData = (preview: DatasetPreview | null) => {
      storeSetPreviewData(preview); 
      console.log("previewData set in store:", useDataStore.getState().previewData);
    };
  
    const fetchCorrelation = async (data: Record<string, any>[]) => {
      setIsCalculating(true); // Set loading state
      setCorrelationError(""); // Reset error message
      try {
        // Ensure data is not empty
        if (!data || data.length === 0) {
          setCorrelationError("No data available for correlation calculation.");
          return;
        }
    
        const payload: Record<string, any[]> = {};
        // Create payload from data
        Object.keys(data[0]).forEach((key) => {
          payload[key] = data.map((row) => row[key]);
        });
    
        // Make API call to fetch correlation matrix
        const response = await axios.post<{ correlation_matrix: Record<string, Record<string, number>> }>(
          `${API_URL}/correlation`,
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );
    
        // Extract correlation matrix and labels
        const matrix = response.data.correlation_matrix;
    
        if (!matrix) {
          throw new Error("No correlation matrix found in the response.");
        }
    
        const labels = Object.keys(matrix);
        const matrixArray = labels.map((rowKey) =>
          labels.map((colKey) => matrix[rowKey]?.[colKey] ?? 0)
        );
    
        setCorrelationLabels(labels); // Update labels state
        setCorrelationMatrix(matrixArray); // Update matrix state
    
      } catch (err: any) {
        console.error("Correlation fetch failed:", err);
        // Set error state with more detailed feedback if possible
        setCorrelationError(err.response?.data?.detail || "Failed to calculate correlation.");
      } finally {
        setIsCalculating(false); // Reset loading state
      }
    };
     

    const handlePredictForm = async (predictionData: Record<string, any>) => {
        setPredictionLoading(true);
        setPredictionError(null);

        try {
            const response = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prediction_factor: selectedFactor, feature_values: predictionData }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'prediction_result.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                const errorData = await response.json();
                setPredictionError(errorData.detail || 'Prediction failed.');
            }
        } catch (error) {
            console.error("Error during prediction:", error);
            setPredictionError("Failed to connect to the server or an unexpected error occurred.");
        } finally {
            setPredictionLoading(false);
        }
    };

    const handleDownloadData = useCallback(async () => {
      if (!uploadedFullData || uploadedFullData.length === 0) {
        console.warn("No data to download.");
        return;
      }
      setDownloadLoading(true);
      setDownloadError(null);
      try {
        const response = await fetch(`${API_URL}/download-dataset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `full_data=${encodeURIComponent(JSON.stringify(uploadedFullData))}`,
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'uploaded_dataset.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          const errorData = await response.json();
          setDownloadError(errorData.detail || 'Failed to download data.');
        }
      } catch (error) {
        console.error("Error during download:", error);
        setDownloadError("Failed to connect to the server or an unexpected error occurred.");
      } finally {
        setDownloadLoading(false);
      }
    }, [uploadedFullData]);  
    
    const handleGenerateChart = () => {
      if (!chartType || selectedChartFeatures.length === 0 || !previewData?.full_data?.length) {
        setChartData(null);
        return;
      }
      const labels: string[] = previewData.full_data.map(item => String(item[selectedChartFeatures[0]]));
      const datasets = selectedChartFeatures.slice(1).map(feature => ({
        label: feature,
        data: previewData.full_data.map(item => Number(item[feature])),
      }));
      setChartData({ labels, datasets: datasets.length > 0 ? datasets : [{ label: selectedChartFeatures[0], data: previewData.full_data.map(() => 1) }] });
    };

    
  const fetchSummary = async () => {
    if (!uploadedFullData || uploadedFullData.length === 0) {
        setSummaryError("No data uploaded to generate summary.");
        setShowSummary(true); 
        return;
    }
    setSummaryLoading(true);
    setSummaryError(null);
    setShowSummary(true); 

    try {
        const response = await axios.post(
            `${API_URL}/dataset-summary`,
            { data: uploadedFullData }, 
            { headers: { 'Content-Type': 'application/json' } }
        );
        setSummary(response.data.summary);
    } catch (error: any) {
        console.error("Error fetching summary:", error);
        setSummaryError(error.response?.data?.detail || "Failed to generate summary.");
        setSummary(null);
    } finally {
        setSummaryLoading(false);
    }
};

    return(
        <div className="min-h-screen bg-indigo-50 rounded-md py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="font-extrabold text-3xl text-indigo-950">Market Analysis Dashboard</h1>
                    <p className="mt-2 text-gray-950">
                        Make predictions based on different market factors
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
                    <div className="mb-6">
                        <label className="block text-sm pl-3 font-medium text-gray-700 mb-2 ">
                            Select Prediction Factor
                        </label>
                        <select value={selectedFactor}
                            onChange={(e) => setSelectedFactor(e.target.value)}
                            className="mt-3 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500
                             focus:border-blue-500 sm:text-sm rounded-md shadow-top-bottom"
                            >
          
                            {predictionFactors.map((factor) => (
                                <option key={factor} value={factor}>
                                    {factor}
                                </option>
                            ))}
                            </select>
                        </div>
                    <div className="mb-6">
                    <div className="flex items-center pl-3 space-x-6">
                        <label className="flex items-center">
                            <input
                            type="radio"
                            name="inputMethod"
                            value="form"
                            checked={inputMethod === 'form'}
                            onChange={() => setInputMethod('form')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"/>
                            <span className="ml-2 text-gray-700">Enter Values</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                type="radio"
                                name="inputMethod"
                                value="upload"
                                checked={inputMethod === 'upload'}
                                onChange={() => setInputMethod('upload')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"/>
                                <span className="ml-2 text-gray-700">Upload Dataset</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex-col overflow-hidden">
                    {inputMethod === 'form' ? (
                      <PredictionForm
                        predictionFactor={selectedFactor}
                        features={features}
                      />
                    ) : (
                      <div className="flex flex-col">
                        <DatasetUpload
                          predictionFactor={selectedFactor}
                          onDataUploaded={handleDataUploaded}
                          onPreviewData={handlePreviewData}
                        />
                        {inputMethod === 'upload' && previewData?.summary && (
                          <div className="bg-white shadow-xl rounded-lg p-6 mt-4">
                            <h3 className="font-medium text-lg mb-2">Data Summary</h3>
                            <div className="p-4 bg-gray-50 rounded-md whitespace-pre-line">
                              {previewData.summary}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <FeatureImportanceChart predictionFactor={selectedFactor} />
                  </div>
                </div>
                {inputMethod === 'upload' && previewData && (
                <div className="bg-white shadow-xl rounded-lg p-6 mb-4 mt-8 overflow-y-hidden">
                  <h3 className="font-semibold text-lg mb-2">Dataset Preview</h3>
                      <TableContainer component={Paper} sx={{ maxHeight: 400, marginTop:2 }}>
                        <Table stickyHeader size="medium" aria-label="dataset preview table">
                          <TableHead>
                            <TableRow>
                              {previewData.columns.map((column) => (
                                <TableCell key={column} sx={{ fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                                  {column}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                        <TableBody>
                        {fullPreviewData.map((row, rowIndex) => (
                          <TableRow key={rowIndex} sx={{ backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9f9f9' }}>
                            {previewData.columns.map((column) => (
                              <TableCell key={`${rowIndex}-${column}`}>{row[column]}</TableCell>
                              ))}
                            </TableRow>
                             ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <div className="mt-4">
                        <button
                          onClick={handleDownloadData}
                          disabled={downloadLoading || !uploadedFullData || uploadedFullData.length === 0}
                          className="bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
                        >
                          {downloadLoading ? 'Downloading...' : 'Download Data'}
                        </button>
                          {downloadError && <p className="mt-2 text-red-500">{downloadError}</p>}
                    </div>
                    <div className="mt-4">
                      <Button
                      variant="contained"
                      color="primary"
                      onClick={fetchSummary}
                      disabled={!uploadedFullData || uploadedFullData.length === 0 || summaryLoading}
                      >
                      {summaryLoading ? 'Generating Summary...' : 'Generate Summary'}
                      </Button>
                      {summaryError && <Typography color="error" className="mt-2">{summaryError}</Typography>}
                      </div>
                  </div>
                )}
                {/* Summary Section */}
                {summary && (
                <div className="mt-6 p-4 bg-indigo-500 shadow-sm rounded-md">
                  <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" className="font-medium">
                      AI-Generated Summary
                    </Typography>
                    <IconButton onClick={() => setShowSummary(prev => !prev)} size="small">
                      {showSummary ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Grid>

                  <Collapse in={showSummary}>
                    <Paper elevation={1} className="mt-2 p-6 prose max-w-none">
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    </Paper>
                  </Collapse>
                </div>
              )}
                <div className="flex flex-grow items-center bg-white shadow-xl rounded-lg p-6 mt-8 overflow-y-hidden">
                  <div className="mb-6 w-full">
                    <p className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Data Set to generate Correlation Heatmap
                    </p>
                    {/* Loading and Error Messages */}
                    {isCalculating && (
                      <p className="text-sm text-gray-600 mt-2">Calculating correlation matrix...</p>
                    )}
                    {correlationError && (
                      <p className="text-sm text-red-500 mt-2">{correlationError}</p>
                    )}
                    {/* Heatmap Render */}
                    {correlationMatrix && correlationLabels && correlationMatrix.length > 0 && correlationLabels.length > 0 ? (
                    <div className="mt-4 overflow-y-auto flex justify-center">
                      <div className="min-w-[600px]">
                        <CorrelationHeatmap
                          data={correlationMatrix}
                          xLabels={correlationLabels}
                          yLabels={correlationLabels}
                        />
                      </div>
                    </div>
                  ) : (
                  <p className="text-sm text-gray-500 mt-4">No correlation data available.</p>
                )}

                  </div>
                </div>
                    </div>
    );}
export default dashboard;