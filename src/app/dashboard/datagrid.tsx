import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

interface DataGridProps {
    originalDataHead: any[];
    predictionResults: any[];
    predictionColumn: string;
}

const DataGrid: React.FC<DataGridProps> = ({ originalDataHead, predictionResults, predictionColumn }) => {
    return (
        <Paper sx={{ width: '100%', height: '400px', overflow: 'auto' }}>
            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {Object.keys(originalDataHead[0]).map((key) => (
                                <TableCell key={key}>
                                    <Typography variant="body2" fontWeight="bold">
                                        {key}
                                    </Typography>
                                </TableCell>
                            ))}
                            <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                    {predictionColumn}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {predictionResults?.map((row, index) => (
                            <TableRow key={index}>
                                {Object.keys(originalDataHead[0]).map((key) => (
                                    <TableCell key={`${index}-${key}`}>
                                        {row[key]}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    {row[predictionColumn]}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default DataGrid;