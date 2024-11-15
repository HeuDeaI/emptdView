async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
            const csvData = e.target.result;
            chartContainer.classList.remove('hidden');
            uploadLabel.style.display = 'none';

            try {
                const apiData = await processFileData(file, csvData);
                resolve(apiData); 
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}


async function processFileData(file, csvData) {
    let apiData = [];
    try {
        const filename = file.name.split('.')[0];
        const parsedData = parseCSV(csvData);

        const minTime = Math.min(...parsedData.map(data => data.time));
        const maxTime = Math.max(...parsedData.map(data => data.time));

        apiData = await fetchBinanceData(filename, minTime, maxTime);

        const { minMove, precision } = calculateMinMove(parsedData[0].open);

        firstSeries.applyOptions({
            priceFormat: {
                minMove,
                precision,
            },
        });

        adjustChartSize();
    } catch (error) {
        console.error('Error processing file:', error);
        alert('There was an error processing the file. Please check the file format and content.');
    }

    return apiData;
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

async function fetchBinanceData(symbol, startTime, endTime) {
    const interval = '3m'; 
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime * 1000}&endTime=${endTime * 1000}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        return data.map(candle => ({
            time: candle[0] / 1000, 
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
        }));
    } catch (error) {
        console.error('Error fetching Binance data:', error);
        alert('There was an error fetching data from Binance. Please try again later.');
        return [];
    }
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
