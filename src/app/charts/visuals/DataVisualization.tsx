import React, { useState, useEffect } from 'react';
import { Button, Select, MultiSelect, Card, Text, Grid } from '@mantine/core';
import dynamic from 'next/dynamic';
import axios from 'axios';

// Dynamically import chart components to avoid SSR issues
const BarChart = dynamic(() => import('./BarChart'), { ssr: false });
const PieChart = dynamic(() => import('./PieChart'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface DataVisualizationProps {
  uploadedData: Record<string, any>[];
  columns: string[];
}

const AGGREGATE_FUNCTIONS = [
  { value: 'mean', label: 'Average (Mean)' },
  { value: 'sum', label: 'Sum' },
  { value: 'max', label: 'Maximum' },
  { value: 'min', label: 'Minimum' },
  { value: 'count', label: 'Count' },
];

const DataVisualization: React.FC<DataVisualizationProps> = ({ uploadedData, columns }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [categoryFeature, setCategoryFeature] = useState<string>('');
  const [valueFeatures, setValueFeatures] = useState<string[]>([]);
  const [aggregateFunction, setAggregateFunction] = useState<string>('mean');
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter numeric columns that can be used for chart values
  const numericColumns = columns.filter(column => {
    if (!uploadedData || uploadedData.length === 0) return false;
    const sampleValue = uploadedData[0][column];
    return typeof sampleValue === 'number' || !isNaN(Number(sampleValue));
  });

  // Filter categorical columns that can be used for labels
  const categoricalColumns = columns.filter(column => {
    if (!uploadedData || uploadedData.length === 0) return true; // Default to showing all columns
    const uniqueValues = new Set(uploadedData.map(row => row[column]));
    return uniqueValues.size < uploadedData.length * 0.5; // If less than 50% unique, likely categorical
  });

  useEffect(() => {
    // Reset selections when data changes
    if (columns.length > 0) {
      setCategoryFeature(categoricalColumns[0] || columns[0]);
      setValueFeatures(numericColumns.length > 0 ? [numericColumns[0]] : []);
    }
  }, [columns, uploadedData]);

  useEffect(() => {
    // Update selected features when category or value features change
    const features = [categoryFeature, ...valueFeatures];
    setSelectedFeatures(features.filter(Boolean));
  }, [categoryFeature, valueFeatures]);

  const generateChart = async () => {
    if (!uploadedData || uploadedData.length === 0 || selectedFeatures.length === 0) {
      setError('No data or features selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/chart-data`, {
        chart_type: chartType,
        features: selectedFeatures,
        data: uploadedData,
        aggregate_function: aggregateFunction,
      });

      setChartData(response.data);
    } catch (err: any) {
      console.error('Error generating chart:', err);
      setError(err.response?.data?.detail || 'Failed to generate chart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="mt-6">
      <Text size="xl" fw={500} className="mb-4">
        Data Visualization
      </Text>

      <Grid>
        <Grid.Col span={6}>
          <div className="mb-4">
            <Text size="sm" fw={500} className="mb-1">
              Chart Type
            </Text>
            <div className="flex space-x-4">
              <button
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 rounded-md ${
                  chartType === 'bar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-4 py-2 rounded-md ${
                  chartType === 'pie'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                Pie Chart
              </button>
            </div>
          </div>
        </Grid.Col>

        <Grid.Col span={6}>
          <div className="mb-4">
            <Text size="sm" fw={500} className="mb-1">
              Aggregation Function
            </Text>
            <select
              value={aggregateFunction}
              onChange={(e) => setAggregateFunction(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {AGGREGATE_FUNCTIONS.map((func) => (
                <option key={func.value} value={func.value}>
                  {func.label}
                </option>
              ))}
            </select>
          </div>
        </Grid.Col>

        <Grid.Col span={6}>
          <div className="mb-4">
            <Text size="sm" fw={500} className="mb-1">
              Category (X-Axis/Labels)
            </Text>
            <select
              value={categoryFeature}
              onChange={(e) => setCategoryFeature(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {categoricalColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>
        </Grid.Col>

        <Grid.Col span={6}>
          <div className="mb-4">
            <Text size="sm" fw={500} className="mb-1">
              Values to Chart
            </Text>
            <select
              multiple
              value={valueFeatures}
              onChange={(e) => {
                const selectedOptions = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setValueFeatures(selectedOptions);
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
              style={{ height: '100px' }}
            >
              {numericColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <Text size="xs" color="dimmed" className="mt-1">
              Hold Ctrl/Cmd to select multiple
            </Text>
          </div>
        </Grid.Col>
      </Grid>

      <button
        onClick={generateChart}
        disabled={isLoading || selectedFeatures.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 mt-2"
      >
        {isLoading ? 'Generating Chart...' : 'Generate Chart'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {chartData && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <Text size="lg" fw={500} className="mb-4">
            Chart Results
          </Text>
          <div style={{ height: '400px' }}>
            {chartType === 'bar' ? (
              <BarChart data={chartData} />
            ) : (
              <PieChart data={chartData} chartRef={undefined} />
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default DataVisualization;