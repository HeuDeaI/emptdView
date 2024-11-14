let updateTimer;           
let currentIndex = 0; 
let updateInterval = 250; 
let isRunning = false;

function updateSpeed(speed) {
    updateInterval = 1000 / speed; 

    if (updateTimer) {
        clearInterval(updateTimer);
        startSimulation(); 
    }
}

function startSimulation() {
    updateTimer = setInterval(() => {
        if (currentIndex < apiData.length) {
            candlestickSeries.update(apiData[currentIndex]);
            currentIndex++;
        } else {
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

