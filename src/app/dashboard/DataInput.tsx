import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    SelectChangeEvent,
} from '@mui/material';

interface DataInputProps {
    features: string[];
    onPredict: (inputData: Record<string, any>) => void;
    existingData?: Record<string, any>[];
}

const DataInputForm: React.FC<DataInputProps> = ({ features, onPredict, existingData }) => {
    const [inputValues, setInputValues] = useState<Record<string, any>>({});

    useEffect(() => {
        const initialValues: Record<string, any> = {};
        features.forEach(feature => {
            initialValues[feature] = '';
        });
        setInputValues(initialValues);
    }, [features]);

    const handleSelectChange = (event: SelectChangeEvent) => {
        const { name, value } = event.target;
        setInputValues(prevValues => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setInputValues(prevValues => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handlePredictClick = () => {
        onPredict(inputValues);
    };

    return (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
                Enter Values
            </Typography>
            {features.map((feature) => (
                <FormControl key={feature} fullWidth margin="normal">
                    {existingData?.some(item => item.hasOwnProperty(feature)) ? (
                        <>
                            <InputLabel id={`${feature}-select-label`}>{feature}</InputLabel>
                            <Select
                                labelId={`${feature}-select-label`}
                                id={feature}
                                name={feature}
                                value={inputValues[feature] || ''}
                                label={feature}
                                onChange={handleSelectChange} 
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {Array.from(new Set(existingData.flatMap(item => (item as any)[feature]))).sort().map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </Select>
                        </>
                    ) : (
                        <TextField
                            label={feature}
                            name={feature}
                            value={inputValues[feature] || ''}
                            onChange={handleTextChange} 
                            fullWidth
                        />
                    )}
                </FormControl>
            ))}
            <Button variant="contained" color="primary" onClick={handlePredictClick} sx={{ mt: 2 }}>
                Predict
            </Button>
        </Box>
    );
};

export default DataInputForm;