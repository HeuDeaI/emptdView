const chartContainer = document.getElementById('chart');
const chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: 500,
    layout: {
        background: { 
            type: 'solid', 
            color: '#1e202a',
        },
        textColor: '#d1d4dc',  
    },
    grid: {
        vertLines: {
            color: '#2b2b43',  
        },
        horzLines: {
            color: '#2b2b43',  
        },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: {
            color: '#758696',
            width: 1,
            style: 0,
        },
        horzLine: {
            color: '#758696',
            width: 1,
            style: 0,
        },
    },
    priceScale: {
        borderColor: '#4a4e69', 
        textColor: '#d1d4dc', 
    },
    timeScale: {
        borderColor: '#4a4e69', 
    },
    watermark: {
        color: 'rgba(255, 255, 255, 0.1)', 
        visible: true,
        text: 'emptdView', 
        fontSize: 24,
        fontFamily: 'Arial',
    },
});

const candlestickSeries = chart.addCandlestickSeries({
    upColor: '#4CAF50',           
    downColor: '#FF5252',        
    borderDownColor: '#FF5252',    
    borderUpColor: '#4CAF50',      
    wickDownColor: '#FF5252',      
    wickUpColor: '#4CAF50',     
});

const data = [
    { time: new Date('2024-11-10').getTime() / 1000, open: 78000, high: 80000, low: 77000, close: 78500 },
    { time: new Date('2024-11-11').getTime() / 1000, open: 78500, high: 80500, low: 77500, close: 79500 },
    { time: new Date('2024-11-12').getTime() / 1000, open: 79500, high: 81500, low: 76500, close: 78000 },
    { time: new Date('2024-11-13').getTime() / 1000, open: 78000, high: 79500, low: 77000, close: 78500 },
    { time: new Date('2024-11-14').getTime() / 1000, open: 78500, high: 80000, low: 77000, close: 79000 },
    { time: new Date('2024-11-15').getTime() / 1000, open: 79000, high: 81000, low: 78000, close: 80000 },
    { time: new Date('2024-11-16').getTime() / 1000, open: 80000, high: 82000, low: 79000, close: 81000 },
    { time: new Date('2024-11-17').getTime() / 1000, open: 81000, high: 82500, low: 79500, close: 82000 },
    { time: new Date('2024-11-18').getTime() / 1000, open: 82000, high: 84000, low: 80500, close: 83500 },
    { time: new Date('2024-11-19').getTime() / 1000, open: 83500, high: 85000, low: 82500, close: 84000 },
    { time: new Date('2024-11-20').getTime() / 1000, open: 84000, high: 86000, low: 83000, close: 85000 },
    { time: new Date('2024-11-21').getTime() / 1000, open: 85000, high: 87000, low: 84000, close: 86000 },
    { time: new Date('2024-11-22').getTime() / 1000, open: 86000, high: 88000, low: 85000, close: 87500 },
    { time: new Date('2024-11-23').getTime() / 1000, open: 87500, high: 89000, low: 86000, close: 88500 },
];


candlestickSeries.setData(data);


candlestickSeries.setData(data);

window.addEventListener('resize', () => {
    chart.applyOptions({ width: chartContainer.clientWidth });
});
