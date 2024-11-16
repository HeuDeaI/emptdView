async function handleFileUpload(event) {
    const file = event.target.files[0];

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

async function handleTradeFileUpload(event) {
    const file = event.target.files[0];

    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = (e) => {
            const csvData = e.target.result;
            chartContainer.classList.remove('hidden');
            uploadLabel.style.display = 'none';

            try {
                resolve(csvData);
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

        const minTime = parsedData[0].time;
        const maxTime = parsedData[parsedData.length - 1].time;

        apiData = await fetchBinanceData(filename, '1m', minTime, maxTime);

        if (apiData.length === 0) {
            alert('No data available for the specified time range.');
            return [];
        }

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
    const rows = csvData.trim().split('\n').slice(1);
    if (rows.length === 0) throw new Error('No data in CSV file.');

    return rows.map(row => {
        const columns = row.split(',').map(col => col.trim());
        if (columns.length !== 6) {
            throw new Error('Invalid CSV format. Expected 6 columns.');
        }

        const [index, date, entry, side, take, stop] = columns;
        if (!date || isNaN(entry) || isNaN(take) || isNaN(stop)) {
            throw new Error('Missing or invalid data in CSV row.');
        }

        return {
            time: parseInt(date, 10) / 1000,
            entry: parseFloat(entry),
            side: side.toLowerCase(),
            take: parseFloat(take),
            stop: parseFloat(stop),
        };
    });
}

async function fetchBinanceData(symbol, interval, startTime, endTime) {
    const maxCandles = 1000;
    let data = [];
    let currentStartTime = startTime * 1000;

    while (currentStartTime < endTime * 1000) {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${currentStartTime}&limit=${maxCandles}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 429) {
                    console.warn('Rate limit exceeded, retrying...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                console.error('API Error:', response.status, response.statusText);
                break;
            }

            const chunk = await response.json();
            if (!Array.isArray(chunk) || chunk.length === 0) {
                console.log('No more data available.');
                break;
            }

            data.push(...chunk.map(candle => ({
                time: candle[0] / 1000,
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
            })));

            currentStartTime = chunk[chunk.length - 1][0] + 1;
        } catch (error) {
            console.error('Error fetching or parsing data:', error);
            break;
        }
    }

    return data;
}

function calculateMinMove(price) {
    if (price <= 0) throw new Error('Invalid price value for minMove calculation.');

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
