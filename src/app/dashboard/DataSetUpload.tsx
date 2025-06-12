"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { DatasetPreview } from '../types';

interface DatasetUploadProps {
  predictionFactor: string;
  onDataUploaded: (fullData: Record<string, any>[]) => void;
  onPreviewData: (previewData: DatasetPreview | null) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const DatasetUpload: React.FC<DatasetUploadProps> = ({
  predictionFactor,
  onDataUploaded,
  onPreviewData,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prediction_factor', predictionFactor);

      const response = await axios.post<DatasetPreview & { full_data: Record<string, any>[] }>(
        `${API_URL}/upload-dataset`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onPreviewData(response.data);
      if (response.data.full_data) {
        onDataUploaded(response.data.full_data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during file upload');
      console.error('Upload error:', err);
      onDataUploaded([]);
      onPreviewData(null); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Dataset</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-md file:border-0
                             file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !file}
          className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Uploading...' : 'Upload and Process'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default DatasetUpload;