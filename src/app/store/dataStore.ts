"use client"

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DatasetPreview } from '../types';

interface DataState {
  uploadedFile: File | null;
  uploadedFullData: Record<string, any>[] | null; 
  previewData: DatasetPreview | null;
  setUploadedFile: (file: File | null) => void;
  setUploadedFullData: (data: Record<string, any>[] | null) => void;
  setPreviewData: (data: DatasetPreview | null) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      uploadedFile: null,
      uploadedFullData: null,
      previewData: null,
      setUploadedFile: (file) => set({ uploadedFile: file }),
      setUploadedFullData: (data) => set({ uploadedFullData: data }),
      setPreviewData: (data) => set({ previewData: data }),
    }),
    {
      name: 'market-analysis-data',
      storage: createJSONStorage(() => localStorage),
    }
  )
);