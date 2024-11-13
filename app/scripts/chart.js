const chartContainer = document.getElementById('chart');
const tradeContainer = document.getElementById('trade-container');
const uploadLabel = document.getElementById('upload-label');

const chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: chartContainer.clientHeight,
    layout: {
        background: { type: 'solid', color: '#1e202a' },
        textColor: '#d1d4dc',
    },
    grid: {
        vertLines: { color: '#2b2b43' },
        horzLines: { color: '#2b2b43' },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: { color: '#758696', width: 1, style: 0 },
        horzLine: { color: '#758696', width: 1, style: 0 },
    },
    priceScale: { borderColor: '#4a4e69', textColor: '#d1d4dc' },
    timeScale: {
        borderColor: '#4a4e69',
        timeVisible: true,
        secondsVisible: false,
    },
    watermark: {
        color: 'rgba(255, 255, 255, 0.1)',
        visible: true,
        text: 'Emptd View',
        fontSize: 24,
        fontFamily: 'Arial',
    },
});

const firstSeries = chart.addLineSeries({
    priceFormat: {
        type: 'price',
        minMove: 0.01,
        precision: 2,
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

function adjustChartSize() {
    chart.applyOptions({
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
    });
}

window.addEventListener('resize', adjustChartSize);
