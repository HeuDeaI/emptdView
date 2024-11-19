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
                console.log("YES")
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

async function handleTradeFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
            const csvData = e.target.result;
            chartContainer.classList.remove('hidden');
            uploadLabel.style.display = 'none';

            try {
                resolve(csvData); 
                console.log("YES")
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

        const { minMove, precision } = calculateMinMove(apiData[0].open);

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
    const rows = csvData.split('\n').slice(1);
    if (rows.length === 0) throw new Error('No data in CSV file.');
    return rows.map(row => {
        const columns = row.split(',').map(col => col.trim());
        console.log(columns)
        if (columns.length !== 6) {
            throw new Error('Invalid CSV format. Expected 6 columns.');
        }

        const [index, date, entry, side, take, stop, size, pnl] = columns;
        if (!date || !entry || !take || !stop) {
            throw new Error('Missing necessary data in CSV row.');
        }

        return {
            time: parseInt(date),
            entry: parseFloat(entry), 
            side: side.toLowerCase(), 
            take: parseFloat(take),
            stop: parseFloat(stop), 
            size: 0.0,
            pnl: 0.0,
        };
    });
}

async function fetchBinanceData(symbol, startTime, endTime) {
    const interval = '1m';
    const limit = 500; 
    const urlBase = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`;
    let allData = [];

    try {
        let currentStartTime = startTime;
        const endTimeMs = endTime; 

        while (currentStartTime < endTimeMs) {
            const url = `${urlBase}&startTime=${currentStartTime}&endTime=${endTimeMs}&limit=${limit}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.length === 0) {
                console.log('No more data available.');
                break;
            }

            allData = allData.concat(
                data.map(candle => ({
                    time: candle[0],
                    open: parseFloat(candle[1]),
                    high: parseFloat(candle[2]),
                    low: parseFloat(candle[3]),
                    close: parseFloat(candle[4]),
                    volume: parseFloat(candle[5]),
                }))
            );

            currentStartTime = data[data.length - 1][0] + 1;
            console.log(`Fetched ${data.length} records, moving to ${new Date(currentStartTime).toISOString()}`);
        }

        return allData;
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
