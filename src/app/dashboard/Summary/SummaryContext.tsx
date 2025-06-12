"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';

interface SummaryContextType {
    uploadedFullData: Record<string, any>[] | null;
    setUploadedFullData: React.Dispatch<React.SetStateAction<Record<string, any>[] | null>>;
    summary: string | null;
    setSummary: React.Dispatch<React.SetStateAction<string | null>>;
    summaryLoading: boolean;
    setSummaryLoading: React.Dispatch<React.SetStateAction<boolean>>;
    summaryError: string | null;
    setSummaryError: React.Dispatch<React.SetStateAction<string | null>>;
    showSummary: boolean;
    setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
    generateSummary: () => Promise<void>; 
    API_URL: string;
}

const SummaryContext = createContext<SummaryContextType | undefined>(undefined);

export const SummaryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [uploadedFullData, setUploadedFullData] = useState<Record<string, any>[] | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const generateSummary = async () => { 
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
                `${API_URL}/generate-summary`,
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

    return (
        <SummaryContext.Provider value={{
            uploadedFullData,
            setUploadedFullData,
            summary,
            setSummary,
            summaryLoading,
            setSummaryLoading,
            summaryError,
            setSummaryError,
            showSummary,
            setShowSummary,
            generateSummary, // Provide the generateSummary function
            API_URL,
        }}>
            {children}
        </SummaryContext.Provider>
    );
};

export const useSummary = () => {
    const context = useContext(SummaryContext);
    console.log("Summary Context:", context); 
    if (!context) {
        throw new Error("useSummary must be used within a SummaryProvider");
    }
    return context;
};