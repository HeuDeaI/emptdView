let apiData;
const tradeInfo = document.getElementById("trade-info");

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file');

    fileInput.addEventListener('change', async (event) => {
        try {
            const csvData = await handleTradeFileUpload(event);
            trades = parseCSV(csvData); 
            apiData = await handleFileUpload(event);
        } catch (error) {
            console.error("Error during file upload:", error);
        }
    });
    

    const speedButtons = document.querySelectorAll("button[id^='speedUp']");
    speedButtons.forEach(button => {
        const speed = parseInt(button.id.replace('speedUp', ''));
        button.addEventListener('click', () => {
            updateSpeed(speed);

            speedButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    document.getElementById('apply').addEventListener('click', applyBalance);
    document.getElementById('toggleSimulation').addEventListener('click', toggleSimulation);
});