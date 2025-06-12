"use client"

import React, { useState, useEffect } from 'react';
import { PredictionInput, PredictionResult } from '../types';
import axios from 'axios';

interface PredictionFormProps {
  predictionFactor: string;
  features: string[];
  onPredictionComplete?: (result: PredictionResult) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const PredictionForm: React.FC<PredictionFormProps> = ({ 
  predictionFactor, 
  features,
  onPredictionComplete
}) => {
  const [featureValues, setFeatureValues] = useState<Record<string, any>>({});
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (feature: string, value: any) => {
    setFeatureValues({
      ...featureValues,
      [feature]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const predictionInput: PredictionInput = {
        prediction_factor: predictionFactor,
        feature_values: featureValues
      };
      
      const response = await axios.post<PredictionResult>(
        `${API_URL}/predict-input`, 
        predictionInput
      );
      
      setPrediction(response.data);
      if (onPredictionComplete) {
        onPredictionComplete(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during prediction');
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Enter Values for Prediction</h2>
      <form onSubmit={handleSubmit}>
        {features.map((feature) => (
          <div key={feature} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {feature}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={`Enter value for ${feature}`}
              onChange={(e) => handleInputChange(feature, e.target.value)}
              required
            />
          </div>
        ))}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
        >
          {isLoading ? 'Predicting...' : 'Predict'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {prediction && (
        <div className="mt-6 p-4 bg-green-100 rounded-md">
          <h3 className="font-medium text-green-800">Prediction Result:</h3>
          <p className="mt-2">
            <span className="font-medium">{prediction.prediction_column}:</span>{' '}
            {prediction.prediction}
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;