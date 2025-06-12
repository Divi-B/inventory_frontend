import React, { useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData,
    registerables
} from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    ...registerables
);

interface PieChartProps {
    data: ChartData<'pie'>;
    chartRef: React.RefObject<any>; 
}

const options: ChartOptions<'pie'> = {
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
};

const PieChart: React.FC<PieChartProps> = ({ data, chartRef }) => {
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef) {
            chartRef.current = chartInstanceRef.current;
        }
    }, [chartRef]);

    return <Pie data={data} options={options} ref={chartInstanceRef} />;
};

export default PieChart;