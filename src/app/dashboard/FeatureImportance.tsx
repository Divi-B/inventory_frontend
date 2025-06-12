"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FeatureImportance } from '../types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  BarChart,
  BarChartProps,
  barElementClasses,
} from '@mui/x-charts/BarChart';
import { Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Center } from '@mantine/core';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FeatureImportanceChartProps {
  predictionFactor: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ predictionFactor }) => {
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatureImportance = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get<FeatureImportance>(
          `${API_URL}/feature-importance/${predictionFactor}`
        );
        setFeatureImportance(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch feature importance');
        console.error('Feature importance error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (predictionFactor) {
      fetchFeatureImportance();
    }
  }, [predictionFactor]);

  if (isLoading) {
    return <div className="text-center py-8">Loading feature importance...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (!featureImportance) {
    return null;
  }

  const chartData = featureImportance.features.map((feature, index) => ({
    feature,
    importance: featureImportance.importance_values[index],
}));

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Feature Importance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };


  return (
    <div className="bg-white p-6 align-centre rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Feature Importance</h2>
      <div className="h-80">
      <BarChart
    height={300}
    dataset={chartData}
    series={[
        {
            dataKey: 'importance',
            label: 'Importance',
            color: '#8884d8',
        },
    ]}
    xAxis={[
        {
            dataKey: 'feature',
            label: 'Feature',
            scaleType: 'band',
            tickLabelStyle: {
              fontSize: 11,
              alignItems: 'center',
            },
            labelStyle: {
              transform: 'translateY(10px)',
            },
            tickPlacement:'middle'
        },
    ]}
    yAxis={[
        {
            label: '',
            labelStyle: { textAnchor: 'start' },
        },
    ]}
/>

      </div>
    </div>
  );
};

export default FeatureImportanceChart;
