document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("inputForm");
  const fifoTable = document.getElementById("fifoTable");
  const fifoLabel = document.getElementById("fifoLabel");
  const lruTable = document.getElementById("lruTable");
  const optTable = document.getElementById("optTable");

  function calculateFIFO(pages, frameSize) {
    const frames = [];
    const fifoResults = [];
    let position = 0;
    let faults = 0;
    for (let page of pages) {
      if (!frames.includes(page)) {
        if (frames.length < frameSize) {
          frames.push(page);
          position = (position + 1) % frameSize;
        } else {
          frames[position] = page;
          position = (position + 1) % frameSize;
        }
        faults++;
      }
      fifoResults.push([...frames]);
    }
    return {
      result: fifoResults,
      faults: faults,
    };
  }

  function calculateLRU(pages, frameSize) {
    const frames = [];
    let indexes = new Map();
    const lruResults = [];
    let faults = 0;

    for (let position = 0; position < pages.length; position++) {
      const page = pages[position];

      if (!frames.includes(page)) {
        if (frames.length < frameSize) {
          frames.push(page);
        } else {
          let lru = Number.MAX_VALUE,
            lruIndex = -1;

          for (let i = 0; i < frames.length; i++) {
            if (indexes.get(frames[i]) < lru) {
              lru = indexes.get(frames[i]);
              lruIndex = i;
            }
          }

          frames[lruIndex] = page;
        }
        faults++;
      }
      indexes.set(page, position);
      lruResults.push([...frames]);
    }

    return {
      result: lruResults,
      faults: faults,
    };
  }

  function calculateOPT(pages, frameSize) {
    const frames = [];
    const optResults = [];
    let faults = 0;

    for (let position = 0; position < pages.length; position++) {
      const page = pages[position];

      if (!frames.includes(page)) {
        if (frames.length < frameSize) {
          frames.push(page);
        } else {
          let optIndex = -1;
          let farthest = position + 1;

          for (let i = 0; i < frames.length; i++) {
            let j;
            for (j = position + 1; j < pages.length; j++) {
              if (frames[i] === pages[j]) {
                if (j > farthest) {
                  farthest = j;
                  optIndex = i;
                }
                break;
              }
            }

            if (j === pages.length) {
              optIndex = i;
              break;
            }
          }

          frames[optIndex] = page;
        }
        faults++;
      }
      optResults.push([...frames]);
    }

    return {
      result: optResults,
      faults: faults,
    };
  }

  function display(results, pages, table, faultLabel) {
    table.innerHTML = "";
    const maxLength = Math.max(...results.result.map((arr) => arr.length));
    const headerRow = table.insertRow();
    for (let i = 0; i < results.result.length; i++) {
      const headerCell = document.createElement("th");
      headerCell.textContent = `${pages[i]}`;
      headerRow.appendChild(headerCell);
    }

    for (let row = 0; row < maxLength; row++) {
      const tableRow = table.insertRow();
      for (let col = 0; col < results.result.length; col++) {
        const cell = tableRow.insertCell();
        cell.textContent =
          results.result[col][row] !== undefined
            ? results.result[col][row]
            : "-";
      }
    }
    faultLabel.innerText = `Page Faults: ${results.faults}`;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    // Check if any input field is empty
    const inputs = document.querySelectorAll("form input");
    console.log(inputs);
    const isEmptyInput = Array.from(inputs).some(
      (input) => input.value.trim() === ""
    );

    if (isEmptyInput) {
      alert("Please fill in all input fields.");
      return;
    }
    const refString = document.getElementById("refString").value.trim();
    const frameSize = parseInt(document.getElementById("frameSize").value, 10);
    const pages = refString.split(",").map(Number);

    const fifoResults = calculateFIFO(pages, frameSize);
    display(fifoResults, pages, fifoTable, fifoLabel);

    const lruResults = calculateLRU(pages, frameSize);
    display(lruResults, pages, lruTable, lruLabel);

    const optResults = calculateOPT(pages, frameSize);
    display(optResults, pages, optTable, optLabel);

    const content = document.getElementById("content");
    content.style.visibility = "visible";
  });
});
