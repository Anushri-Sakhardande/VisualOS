let procCount = 0;
let resCount = 0;

function generateTable(tableId, resCount, procCount = 1) {
  const table = document.getElementById(tableId);
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  // Create header row
  const headerRow = document.createElement("tr");
  for (let i = 0; i < resCount; i++) {
    const header = document.createElement("th");
    header.innerHTML = String.fromCharCode(65 + i); // 'A' + i
    headerRow.appendChild(header);
  }
  thead.appendChild(headerRow);

  // Create body rows for procCount
  for (let j = 0; j < procCount; j++) {
    const bodyRow = document.createElement("tr");
    for (let k = 0; k < resCount; k++) {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.className = "inputTable";
      input.min = 0;
      cell.appendChild(input);
      bodyRow.appendChild(cell);
    }
    tbody.appendChild(bodyRow);
  }
}

function getMatrix(tableId, rowCount, colCount) {
  const table = document.getElementById(tableId);
  const matrix = [];
  const rows = table.querySelectorAll("tbody tr");
  for (let i = 0; i < rowCount; i++) {
    const row = rows[i].querySelectorAll("td input");
    matrix[i] = [];
    for (let j = 0; j < colCount; j++) {
      const value = row[j].value;
      if (value === "") {
        alert("Fill empty fields");
        return null;
      }
      matrix[i][j] = parseInt(value);
    }
  }
  return matrix;
}

function findSafeSequence(available, allocation, need) {
  const work = [...available];
  const finish = Array(procCount).fill(false);
  const safeSequence = [];

  let canAllocate;
  do {
    canAllocate = false;
    for (let i = 0; i < procCount; i++) {
      if (!finish[i] && need[i].every((n, j) => n <= work[j])) {
        for (let j = 0; j < resCount; j++) {
          work[j] += allocation[i][j];
        }
        finish[i] = true;
        safeSequence.push(i);
        canAllocate = true;
      }
    }
  } while (canAllocate);

  return finish.every((f) => f) ? safeSequence : null;
}

document.addEventListener("DOMContentLoaded", () => {


  document.getElementById("ProcNo").addEventListener("input", function () {
    procCount = parseInt(this.value);
  });

  document.getElementById("ResNo").addEventListener("input", function () {
    resCount = parseInt(this.value);
    if (procCount && resCount) {
        generateTable("availTable", resCount);
        generateTable("allocTable", resCount, procCount);
        generateTable("maxTable", resCount, procCount);
        const tables = document.getElementById("tables");
        tables.style.visibility = "visible";
        const button = document.getElementById("calcButton");
        button.style.visibility = "visible";
      }
  });
  

  const form = document.getElementById("form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const allocation = getMatrix("allocTable", procCount, resCount);
    const maximum = getMatrix("maxTable", procCount, resCount);
    const available = getMatrix("availTable", 1, resCount)[0];

    if (!allocation || !maximum || !available) {
      return; 
    }

    const need = [];
    for (let i = 0; i < procCount; i++) {
      need[i] = [];
      for (let j = 0; j < resCount; j++) {
        need[i][j] = maximum[i][j] - allocation[i][j];
      }
    }

    const safeSequence = findSafeSequence(available, allocation, need);
    const safeLabel = document.getElementById("safeSequence");
    safeLabel.innerText += safeSequence
      ? safeSequence.join(", ")
      : "No safe sequence found";
    safeLabel.style.visibility = "visible";
  });
});
