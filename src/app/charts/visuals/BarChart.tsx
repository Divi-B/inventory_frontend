import React, { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData,
    registerables
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(...registerables);

interface BarChartProps {
    data: ChartData<'bar'>;
    containerRef?: React.RefObject<HTMLDivElement>; 
}

const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: false,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
        },
    },
};

const BarChart: React.FC<BarChartProps> = ({ data, containerRef }) => {
    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default BarChart;
