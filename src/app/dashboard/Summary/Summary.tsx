"use client";

import React from 'react';
import { Button, Typography } from '@mui/material';
import { useSummary } from './SummaryContext'; 

const Summary: React.FC = () => {
    const { summary, summaryLoading, summaryError, setShowSummary } = useSummary();

    return (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Generated Summary</h3>
            {summaryLoading && <Typography>Loading summary...</Typography>}
            {summaryError && <Typography color="error">{summaryError}</Typography>}
            {summary && <Typography className="whitespace-pre-line">{summary}</Typography>}
            <Button onClick={() => setShowSummary(false)} sx={{ mt: 2 }}>
                Close Summary
            </Button>
        </div>
    );
};

export default Summary;