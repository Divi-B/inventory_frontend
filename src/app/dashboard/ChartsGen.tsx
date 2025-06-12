"use client";

import React, { useEffect, useRef } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Button } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface PredictionResult {
  [key: string]: any;
}

interface ChartsGenProps {
  fullData: PredictionResult[] | null;
  predictionColumn: string;
  selectedChartFeatures: string[];
  onFeatureToggle: (feature: string) => void;
}

const ChartsGen: React.FC<ChartsGenProps> = ({
  fullData,
  predictionColumn,
  selectedChartFeatures,
  onFeatureToggle,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

 
  if (!fullData || fullData.length === 0 || !predictionColumn) {
    return <Typography>No data available to generate charts.</Typography>;
  }

  const chartableFeatures = Object.keys(fullData[0]).filter(
    (key) => key !== predictionColumn && typeof fullData[0][key] === 'number'
  );

  if (chartableFeatures.length === 0) {
    return <Typography>No valid features available for charting.</Typography>;
  }

  const handleDownloadCharts = () => {
    if (chartRef.current) {
      const svgElements = chartRef.current.querySelectorAll('.recharts-surface');
      if (svgElements.length > 0) {
        let combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${350 * selectedChartFeatures.length}">`;
        svgElements.forEach((svg, index) => {
          const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
          const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          wrapper.setAttribute('transform', `translate(0, ${index * 350})`);
          wrapper.innerHTML = clonedSvg.outerHTML;
          combinedSvg += wrapper.outerHTML;
        });
        combinedSvg += `</svg>`;

        const svgBlob = new Blob([combinedSvg], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const link = document.createElement('a');
        link.href = svgUrl;
        link.download = 'prediction_charts.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(svgUrl);
      } else {
        alert('No charts to download.');
      }
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Chart Generator
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {chartableFeatures.map((feature) => (
          <FormControlLabel
            key={feature}
            control={
              <Checkbox
                value={feature}
                checked={selectedChartFeatures.includes(feature)}
                onChange={() => onFeatureToggle(feature)}
              />
            }
            label={feature}
          />
        ))}
      </Box>

      <Box sx={{ mt: 3 }} ref={chartRef}>
        {selectedChartFeatures.map((feature) => (
          <Box key={feature} sx={{ height: 300, mt: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              {feature} vs {predictionColumn}
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fullData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={feature} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={predictionColumn} fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ))}
      </Box>

      {selectedChartFeatures.length > 0 && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={handleDownloadCharts}
          sx={{ mt: 3 }}
        >
          Download Charts
        </Button>
      )}
    </Box>
  );
};

export default ChartsGen;
