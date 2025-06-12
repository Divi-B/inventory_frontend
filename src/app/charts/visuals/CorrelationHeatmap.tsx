import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from "@mui/material";
import { Tooltip } from "@mui/material";

const getHeatColor = (value: number) => {
  const hue = ((1 - Math.abs(value)) * 120).toString(10); // green (120) to red (0)
  return `hsl(${value >= 0 ? hue : 0}, 80%, ${value === 0 ? 100 : 65}%)`;
};

interface CorrelationHeatmapProps {
    data: number[][];
    xLabels: string[]; 
    yLabels: string[]; 
  }

  const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
    data, 
    xLabels, 
    yLabels, 
  }) => {
    if (!data || data.length === 0) {
      return <Typography variant="h6">Loading or no data available...</Typography>;
    }
  
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Correlation Heatmap
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                {xLabels.map((col) => (
                  <TableCell key={col} align="center" sx={{ fontWeight: "bold" }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {yLabels.map((rowKey, rowIndex) => (
                <TableRow key={rowKey}>
                  <TableCell sx={{ fontWeight: "bold" }}>{rowKey}</TableCell>
                  {xLabels.map((colKey, colIndex) => {
                    const value = data[rowIndex][colIndex] ?? 0;
                    return (
                      <TableCell
                        key={`${rowKey}-${colKey}`}
                        align="center"
                        sx={{
                          backgroundColor: getHeatColor(value),
                          color: Math.abs(value) > 0.5 ? "white" : "black",
                        }}
                      >
                        {value.toFixed(2)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
};

export default CorrelationHeatmap;
