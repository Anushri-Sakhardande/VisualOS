const colors = [
    "#FF5733", "#33FF57", "#3357FF", "#F33FF5", "#F5A233",
    "#33F5A2", "#A233F5", "#FF33A2", "#A2F533", "#33A2F5"
];

function calculateFCFS(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    const schedule = [];
    let currentTime = 0;
    processes.forEach(process => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        const processExec = {
            id: process.process,
            startTime: currentTime,
            endTime: currentTime + process.burstTime
        };
        schedule.push(processExec);
        process.waitingTime = currentTime - process.arrivalTime;
        process.turnaroundTime = process.waitingTime + process.burstTime;
        currentTime += process.burstTime;
    });
    return {
        schedule,
        processes
    }
}

function calculateNonPreSJF(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    const schedule = [];
    const waitingQueue = [];
    let currentTime = 0;

    while (processes.length > 0 || waitingQueue.length > 0) {
        while (processes.length > 0 && processes[0].arrivalTime <= currentTime) {
            waitingQueue.push(processes.shift());
        }

        waitingQueue.sort((a, b) => a.burstTime - b.burstTime);

        if (waitingQueue.length > 0) {
            const process = waitingQueue.shift();
            const processExec = {
                id: process.process,
                startTime: currentTime,
                endTime: currentTime + process.burstTime
            };
            schedule.push(processExec);
            process.waitingTime = currentTime - process.arrivalTime;
            process.turnaroundTime = process.waitingTime + process.burstTime;
            currentTime += process.burstTime;
        } else {
            currentTime = processes[0].arrivalTime;
        }
    }

    return {
        schedule,
        processes
    };
}

function calculatePreSJF(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    const n = processes.length;
    const remainingTime = processes.map(p => p.burstTime);
    const schedule = [];
    let currentTime = 0;
    let completed = 0;
    let minRemainingTime = Infinity;
    let shortest = -1;
    let finishTime;
    let check = false;

    processes.forEach(p => {
        p.waitingTime = 0;
        p.turnaroundTime = 0;
    });

    while (completed !== n) {
        for (let i = 0; i < n; i++) {
            if (processes[i].arrivalTime <= currentTime && remainingTime[i] < minRemainingTime && remainingTime[i] > 0) {
                minRemainingTime = remainingTime[i];
                shortest = i;
                check = true;
            }
        }
        if (!check) {
            currentTime++;
            continue;
        }
        const processExec = {
            id: processes[shortest].process,
            startTime: currentTime,
            endTime: currentTime + 1
        };
        schedule.push(processExec);
        remainingTime[shortest]--;

        minRemainingTime = remainingTime[shortest];
        if (minRemainingTime === 0) {
            minRemainingTime = Infinity;
            completed++;
            check = false;

            finishTime = currentTime + 1;

            processes[shortest].waitingTime = finishTime - processes[shortest].burstTime - processes[shortest].arrivalTime;
            if (processes[shortest].waitingTime < 0) {
                processes[shortest].waitingTime = 0;
            }

            processes[shortest].turnaroundTime = processes[shortest].burstTime + processes[shortest].waitingTime;
        }
        currentTime++;
    }
    return {
        schedule,
        processes
    };
}

function calculateNonPrePri(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    const schedule = [];
    const waitingQueue = [];
    let currentTime = 0;

    processes.forEach(p => {
        p.waitingTime = 0;
        p.turnaroundTime = 0;
    });

    while (processes.length > 0 || waitingQueue.length > 0) {
        while (processes.length > 0 && processes[0].arrivalTime <= currentTime) {
            waitingQueue.push(processes.shift());
        }

        waitingQueue.sort((a, b) => a.priority - b.priority);

        if (waitingQueue.length > 0) {
            const process = waitingQueue.shift();
            const processExec = {
                id: process.process,
                startTime: currentTime,
                endTime: currentTime + process.burstTime
            };
            schedule.push(processExec);

            process.waitingTime = currentTime - process.arrivalTime;
            process.turnaroundTime = process.waitingTime + process.burstTime;

            currentTime += process.burstTime;
        } else if (processes.length > 0) {
            currentTime = processes[0].arrivalTime;
        }
    }

    return {
        schedule,
        processes
    };
}

function calculatePrePri(processes){
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    const n = processes.length;
    const remainingTime = processes.map(p => p.burstTime);
    const schedule = [];
    let currentTime = 0;
    let completed = 0;
    let minPriority = Infinity;
    let critical = -1;
    let finishTime;
    let check = false;

    processes.forEach(p => {
        p.waitingTime = 0;
        p.turnaroundTime = 0;
    });

    while (completed !== n) {
        for (let i = 0; i < n; i++) {
            if (processes[i].arrivalTime <= currentTime &&  remainingTime[i] > 0 && processes[i].priority<minPriority) {
                minPriority = processes[i].priority;
                critical = i;
                check = true;
            }
        }
        if (!check) {
            currentTime++;
            continue;
        }
        const processExec = {
            id: processes[critical].process,
            startTime: currentTime,
            endTime: currentTime + 1
        };
        schedule.push(processExec);
        remainingTime[critical]--;

        if (remainingTime[critical] === 0) {
            minPriority = Infinity;
            completed++;
            check = false;

            finishTime = currentTime + 1;

            processes[critical].waitingTime = finishTime - processes[critical].burstTime - processes[critical].arrivalTime;
            if (processes[critical].waitingTime < 0) {
                processes[critical].waitingTime = 0;
            }

            processes[critical].turnaroundTime = processes[critical].burstTime + processes[critical].waitingTime;
        }
        currentTime++;
    }
    return {
        schedule,
        processes
    };
}

function calculateRR(processes,quantum){
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    const n = processes.length;
    const schedule = [];
    let currentTime = 0;
    let remainingTime = processes.map(p => p.burstTime);
    let completed=0;

    while (completed<n) {
        let progressMade = false;
        for (let i = 0; i < n; i++) {
            if (remainingTime[i] > 0) {
                const executeTime = Math.min(quantum, remainingTime[i]);
                const processExec = {
                    id: processes[i].process,
                    startTime: currentTime,
                    endTime: currentTime + executeTime
                };
                schedule.push(processExec);

                remainingTime[i] -= executeTime;

                currentTime += executeTime;
                if(remainingTime[i]==0){
                    completed++;
                    processes[i].waitingTime = currentTime - processes[i].arrivalTime;
                    processes[i].turnaroundTime = processes[i].waitingTime + processes[i].burstTime;
                }
                progressMade = true;
            }
        }
        if (!progressMade) {
            // If no progress is made in the current iteration, break out of the loop
            break;
        }
    }
    console.log(schedule);
    return {
        schedule,
        processes
    };

}

function drawGraph(schedule, canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const margin = 20;
    const hscale = (canvas.width - 2 * margin) / schedule.at(-1).endTime;
    const vscale = 40;
    const barHeight = 30;

    // Draw axis
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin);
    ctx.stroke();

    // Draw schedule
    ctx.fillStyle = "gray";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "14px Arial";

    for (let i = 0; i < schedule.length; i++) {
        const startX = margin + schedule[i].startTime * hscale;
        const endX = margin + schedule[i].endTime * hscale;
        const midX = (startX + endX) / 2;
        const y = canvas.height - margin - vscale;

        // Draw process execution bar
        ctx.fillStyle = colors[schedule[i].id - 1];
        ctx.fillRect(startX, y, endX - startX, barHeight);
        ctx.strokeRect(startX, y, endX - startX, barHeight);

        // Draw process ID in the middle of the bar
        ctx.fillStyle = "black";
        ctx.fillText(`P${schedule[i].id}`, midX, y + barHeight / 2);

        // Label start and end times
        ctx.fillText(schedule[i].startTime, startX, canvas.height - margin / 2);
        ctx.fillText(schedule[i].endTime, endX, canvas.height - margin / 2);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('rowNumber').addEventListener('input', function() {
        const rowCount = parseInt(this.value);
        const tableBody = document.querySelector('#processTable tbody');

        tableBody.innerHTML = '';

        for (let i = 0; i < rowCount; i++) {
            const row = document.createElement('tr');
            const pid = document.createElement('td');
            pid.innerHTML = i + 1;
            row.appendChild(pid);
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 0;
                input.className = 'inputTable';
                cell.appendChild(input);
                row.appendChild(cell);
            }

            tableBody.appendChild(row);
        }
        const table = document.getElementById('processTable');
        const button = document.getElementById('calcButton');
        button.style.visibility="visible";
        table.style.visibility = "visible";
    });

    const form = document.getElementById('form');
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const tableBody = document.querySelector('#processTable tbody');
        const rowCount = tableBody.rows.length;
        const processes = [];

        for (let i = 0; i < rowCount; i++) {
            const row = tableBody.rows[i];
            const inputs = row.querySelectorAll('input');
        
            // Check if any input field is empty
            const isEmptyInput = Array.from(inputs).some(input => input.value.trim() === '');
        
            if (isEmptyInput) {
                alert('Please fill in all input fields.');
                return;
            }
            const process = {
                process: i + 1,
                arrivalTime: parseInt(inputs[0].value),
                burstTime: parseInt(inputs[1].value),
                priority: parseInt(inputs[2].value)
            };
            processes.push(process);
        }
        

        //A copy of the process array is made so that the modification in each function doesn't affect the original array
        const fcfscanvas = document.getElementById('fcfsCanvas');
        const fcfsProcesses = JSON.parse(JSON.stringify(processes));
        const fcfs = calculateFCFS(fcfsProcesses);
        drawGraph(fcfs.schedule, fcfscanvas);

        const npSJFcanvas = document.getElementById('npSJFCanvas');
        const npSJFProcesses = JSON.parse(JSON.stringify(processes));
        const nonPreSJF = calculateNonPreSJF(npSJFProcesses);
        drawGraph(nonPreSJF.schedule, npSJFcanvas);

        const pSJFcanvas = document.getElementById('pSJFCanvas');
        const pSJFProcesses = JSON.parse(JSON.stringify(processes));
        const preSJF = calculatePreSJF(pSJFProcesses);
        drawGraph(preSJF.schedule, pSJFcanvas);

        const npPricanvas = document.getElementById('npPriCanvas');
        const npPriProcesses = JSON.parse(JSON.stringify(processes));
        const nonPrePri = calculateNonPrePri(npPriProcesses);
        drawGraph(nonPrePri.schedule, npPricanvas);

        const pPricanvas = document.getElementById('pPriCanvas');
        const pPriProcesses = JSON.parse(JSON.stringify(processes));
        const PrePri = calculatePrePri(pPriProcesses);
        drawGraph(PrePri.schedule, pPricanvas);

        const quantum = parseInt(document.getElementById('quantum').value);
        console.log(quantum);
        const RRcanvas = document.getElementById('RRCanvas');
        const RRProcesses = JSON.parse(JSON.stringify(processes));
        const RR = calculateRR(RRProcesses,quantum);
        drawGraph(RR.schedule, RRcanvas);

        const content = document.getElementById("content");
    content.style.visibility = "visible";
    });
});
