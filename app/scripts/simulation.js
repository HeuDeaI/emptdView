let updateTimer;           
let currentIndex = 0; 
let updateInterval = 250; 
let isRunning = false;
let balance = parseFloat(document.getElementById("balance-input").value);
let leverage = parseFloat(document.getElementById("leverage-input").value);
let riskTrade = parseFloat(document.getElementById("risk-input").value) / 100.0;
let isInTrade = false;
let curTrade = 0;

function applyBalance(){
    balance = parseFloat(document.getElementById("balance-input").value);
    leverage = parseFloat(document.getElementById("leverage-input").value);
    riskTrade = parseFloat(document.getElementById("risk-input").value) / 100.0;
}

function updateSpeed(speed) {
    updateInterval = 1000 / speed; 

    if (updateTimer) {
        clearInterval(updateTimer);
        startSimulation(); 
    }
}
let tradeHistory = [];  
function updateHistory(){
    let historyHtml = '<strong>Trade History:</strong><br>';
    tradeHistory.forEach((t, index) => {
        let date = new Date(t.time );

        historyHtml += `
            <p><strong>Trade ${index + 1}:</strong><strong>Date:${date.toString()}</strong>Entry: ${t.entry},Side: ${t.side} ,Stop: ${t.stop}, Take: ${t.take}, 
            Size: ${t.size.toFixed(2)}, P&L: ${t.pnl.toFixed(2)}, Balance: ${t.balance}</p>
        `;
    });

    tradeInfo.innerHTML += `<div>${historyHtml}</div>`;
}
function saveToTextFile(data, filename = 'tradeHistory.txt') {
    const rows = data.map(row => 
        `${row.time},${row.entry},${row.stop},${row.take},${row.size},${row.pnl},${row.side},${row.balance}`
    ).join('\n'); 

    const blob = new Blob([rows], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
function updateTradeInfo(trade) {
    console.log(trade.pnl)
    if (trade) {

        tradeHistory.push({
            time: trade.time,
            entry: trade.entry,
            stop: trade.stop,
            take: trade.take,
            size: trade.size || 0,
            pnl: trade.pnl || 0,
            side: trade.side,
            balance: balance.toFixed(2),
        });
        let date = new Date(trade.time);

        tradeInfo.innerHTML = `
            <strong>Active Trade:</strong><br>
            <p><strong>Date:</strong> ${date.toString()}</p>
            <p><strong>Entry:</strong> ${trade.entry}</p>
            <p><strong>Side:</strong> ${trade.side}</p>
            <p><strong>Stop:</strong> ${trade.stop}</p>
            <p><strong>Take:</strong> ${trade.take}</p>
            <p><strong>Size:</strong> ${(trade.size || 0).toFixed(2)}</p>
            <p><strong>Current P&L:</strong> ${(trade.pnl || 0).toFixed(2)}</p>
            <p><strong>Balance:</strong> ${balance.toFixed(2)}</p>
        `;

    } else {
        tradeInfo.innerHTML = `<p>No active trades</p>`;
    }
}

function percentageDifference(entry, target) {
    return Math.abs(((target - entry) / entry)) * 100;
}
function deleteLines(tradeNow){
    if (currentTrade.takeLine) {
        candlestickSeries.removePriceLine(currentTrade.takeLine);
    }
    if (currentTrade.stopLine) {
        candlestickSeries.removePriceLine(currentTrade.stopLine);
    }
}
function updateTradeHistory(trade) {
    const tradeIndex = tradeHistory.findIndex(t => t.entry === trade.entry && t.stop === trade.stop && t.take === trade.take);
    if (tradeIndex !== -1) {
        tradeHistory[tradeIndex].pnl = trade.pnl;
        tradeHistory[tradeIndex].balance = balance.toFixed(2);
    }
}

function startSimulation() {
    updateTimer = setInterval(() => {
        if (currentIndex < apiData.length) {
            const candle = apiData[currentIndex];
            candlestickSeries.update(candle);
            if (isInTrade){
//Trade 12: Entry: 32.465,Side: short ,Stop: 32.54556616, Take: 32.26358461, Size: 1920.02, P&L: 59.56, Balance: 1250.76
                if (curTrade.side == "SHORT"){
                    if (candle.high >= curTrade.stop){
                        sizeTo = curTrade.size * (percentageDifference(curTrade.entry, curTrade.stop) / 100.0 ) * 5 ;
                        balance -= sizeTo;
                        curTrade.pnl = -sizeTo;
                        deleteLines(curTrade);
                        isInTrade = false;
                        updateTradeInfo(curTrade);
                        updateHistory();
                        updateTradeHistory(curTrade);

                    }
                    if(candle.low <= curTrade.take){
                        sizeTo = curTrade.size * (percentageDifference(curTrade.entry, curTrade.take) / 100.0 ) * 5;
                        balance += sizeTo;
                        curTrade.pnl = sizeTo;
                        deleteLines(curTrade);
                        isInTrade = false;
                        updateTradeInfo(curTrade);
                        updateHistory();
                        updateTradeHistory(curTrade);


                    }
                }
                else{
                    
                    if(candle.low <= curTrade.stop){
                        sizeTo = curTrade.size * (percentageDifference(curTrade.entry, curTrade.stop) / 100.0) * 5;
                        balance -= sizeTo;
                        curTrade.pnl = -sizeTo;
                        deleteLines(curTrade);
                        isInTrade = false;
                        updateTradeInfo(curTrade);

                        updateHistory();
                        updateTradeHistory(curTrade);
                        

                    }
                    if (candle.high >= curTrade.take){
                        sizeTo = curTrade.size * (percentageDifference(curTrade.entry, curTrade.take) / 100.0 ) * 5;
                        balance += sizeTo;
                        curTrade.pnl = sizeTo;
                        deleteLines(curTrade);
                        isInTrade = false;
                        updateTradeInfo(curTrade);

                        updateHistory();
                        updateTradeHistory(curTrade);


                    }
                }
            }
            else{
                curTrade = trades.find(trade => trade.time === candle.time);
            if (curTrade) {
              //  updateSpeed(1);
                let temp = balance * riskTrade;
                let dist = percentageDifference(curTrade.entry, curTrade.stop);
                isInTrade = true;
                curTrade.size = (temp / dist) * leverage;
                updateTradeInfo(curTrade);
                updateHistory();
                displayTrade(curTrade);
            }
        }

            currentIndex++;
        } else {
            saveToTextFile(tradeHistory);
            stopSimulation();
        }
    }, updateInterval);
}


function stopSimulation() {
    if (updateTimer) {
        clearInterval(updateTimer); 
        updateTimer = null; 
    }
}

function toggleSimulation() {
    const button = document.getElementById('toggleSimulation');
    
    if (isRunning) {
        stopSimulation();
        button.textContent = 'Start';
        button.classList.remove('stop');
    } else {
        startSimulation();
        button.textContent = 'Stop';
        button.classList.add('stop');
    }
    
    isRunning = !isRunning;
}

