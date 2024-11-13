const chartContainer = document.getElementById('chart');
const uploadLabel = document.getElementById('upload-label');
const chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: 500,
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
        text: 'emptdView',
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

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const csvData = e.target.result;
        chartContainer.classList.remove('hidden');
        uploadLabel.style.display = 'none';

        processCSVData(csvData);
    };
    reader.readAsText(file);
}

function processCSVData(csvData) {
    try {
        const parsedData = parseCSV(csvData);
        const { minMove, precision } = calculateMinMove(parsedData[0].open);

        firstSeries.applyOptions({
            priceFormat: {
                minMove,
                precision,
            },
        });

        candlestickSeries.setData(parsedData);

        adjustChartSize();
    } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('There was an error parsing the file. Please check the file format.');
    }
}

function parseCSV(csvData) {
    const rows = csvData.trim().split('\n').slice(1);
    if (rows.length === 0) throw new Error('No data in CSV file.');

    return rows.map(row => {
        const columns = row.split(',').map(col => col.trim());
        
        if (columns.length !== 6) {
            throw new Error('Invalid CSV format. Expected 6 columns.');
        }

        const [index, date, entry, side, take, stop] = columns;
        
        if (!date || !entry || !take) {
            throw new Error('Missing necessary data in CSV row.');
        }

        return {
            time: parseInt(date) / 1000, 
            open: parseFloat(entry),
            high: parseFloat(entry),
            low: parseFloat(take),
            close: parseFloat(take),
        };
    });
}

function calculateMinMove(price) {
    const priceStr = price.toString();
    const decimalIndex = priceStr.indexOf('.');

    if (decimalIndex === -1) {
        return { minMove: 1, precision: 0 };
    }

    const decimalPlaces = priceStr.length - decimalIndex - 1;
    const minMove = Math.pow(10, -decimalPlaces);

    return {
        minMove: parseFloat(minMove.toFixed(10)),
        precision: decimalPlaces,
    };
}

function adjustChartSize() {
    chart.applyOptions({
        width: chartContainer.clientWidth,
    });
}

window.addEventListener('resize', adjustChartSize);