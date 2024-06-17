const MIN = 0;
const MAX = 199;

function calculateFCFS(requests, initial) {
  const order = [initial, ...requests];
  const overhead = order.reduce((acc, current, idx, arr) => {
    if (idx === 0) return acc;
    return acc + Math.abs(current - arr[idx - 1]);
  }, 0);

  return {
    order,
    overhead,
  };
}

function calculateSSTF(requests, initial) {
  const order = [initial];
  let overhead = 0;
  let current = initial;
  const remaining = [...requests];
  for (let i = 0; i < requests.length; i++) {
    const closest = remaining.reduce(
      (acc, request, index) => {
        const distance = Math.abs(request - current);
        if (distance < acc.distance) {
          return {
            distance,
            index,
          };
        }
        return acc;
      },
      { distance: Infinity, index: -1 }
    );

    overhead += closest.distance;
    order.push(remaining.splice(closest.index, 1)[0]);
    current = order[order.length - 1];
  }

  return {
    order,
    overhead,
  };
}

function calculateSCAN(requests, initial, direction) {
  const order = [initial];
  let overhead = 0;
  const sortedReq = [...requests].sort((a, b) => a - b);
  const remaining = sortedReq.filter((request) => request >= initial);
  const before = sortedReq.filter((request) => request < initial);
  if (direction == "left") {
    order.push(...remaining);
    order.push(MAX);
    order.push(...before.reverse());
    overhead = MAX - initial + (MAX - before[0]);
  } else {
    order.push(...before.reverse());
    order.push(MIN);
    order.push(...remaining);
    overhead = initial - MIN + (before[0] - MIN);
  }

  return {
    order,
    overhead,
  };
}

function calculateCSCAN(requests, initial, direction) {
  const order = [initial];
  let overhead = 0;
  const sortedReq = [...requests].sort((a, b) => a - b);
  const remaining = sortedReq.filter((request) => request >= initial);
  const before = sortedReq.filter((request) => request < initial);
  if (direction == "left") {
    order.push(...remaining);
    order.push(MAX);
    order.push(MIN);
    order.push(...before);
    overhead = MAX - initial + (MAX - MIN) + (before.at(-1) - MIN);
  } else {
    order.push(...before.reverse());
    order.push(MIN);
    order.push(MAX);
    order.push(...remaining.reverse());
    overhead = initial - MIN + (MAX - MIN) + (MAX - remaining[0]);
  }
  return {
    order,
    overhead,
  };
}

function calculateLOOK(requests, initial, direction) {
  const order = [initial];
  let overhead = 0;
  const sortedReq = [...requests].sort((a, b) => a - b);
  const remaining = sortedReq.filter((request) => request >= initial);
  const before = sortedReq.filter((request) => request < initial);
  if (direction == "left") {
    order.push(...remaining);
    order.push(...before.reverse());
    overhead = remaining.at(-1) - initial + (remaining.at(-1) - before[0]);
  } else {
    order.push(...before.reverse());
    order.push(...remaining);
    overhead = initial - before[0] + (remaining.at(-1) - before[0]);
  }

  return {
    order,
    overhead,
  };
}

function calculateCLOOK(requests, initial, direction) {
  const order = [initial];
  let overhead = 0;
  const sortedReq = [...requests].sort((a, b) => a - b);
  const remaining = sortedReq.filter((request) => request >= initial);
  const before = sortedReq.filter((request) => request < initial);
  if (direction == "left") {
    order.push(...remaining);
    order.push(...before);
    overhead = initial - before[0] + (remaining.at(-1) - initial);
  } else {
    order.push(...before.reverse());
    order.push(...remaining.reverse());
    overhead = initial - before[0] + (remaining.at(-1) - initial);
  }
  return {
    order,
    overhead,
  };
}

function drawGraph(order, canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const margin = 20;
  const maxCylinder = MAX + margin;
  const hscale = canvas.width / maxCylinder;
  const vscale = canvas.height / order.length;

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;

  // Draw axis
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(canvas.width - margin, margin);
  ctx.stroke();

  // Draw points
  ctx.fillStyle = "gray";
  for (let i = 0; i < order.length; i++) {
    ctx.beginPath();
    ctx.arc(margin + order[i] * hscale, margin, 5, margin, 2 * Math.PI);
    ctx.fill();
  }

  // Label points
  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  for (let i = 0; i < order.length; i++) {
    ctx.fillText(order[i], margin + order[i] * hscale - 5, margin - 5);
  }

  // Draw requests
  ctx.beginPath();
  ctx.moveTo(margin + initial * hscale, margin);

  for (let i = 1; i <= order.length; i++) {
    ctx.lineTo(margin + order[i - 1] * hscale, i * vscale - margin);
  }

  ctx.stroke();

  //show head movement
  ctx.fillStyle = "red";
  for (let i = 1; i <= order.length; i++) {
    ctx.beginPath();
    ctx.arc(
      margin + order[i - 1] * hscale,
      i * vscale - margin,
      5,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("inputForm");
  const fcfsCanvas = document.getElementById("fcfs");
  const sstfCanvas = document.getElementById("sstf");
  const scanCanvas = document.getElementById("scan");
  const cscanCanvas = document.getElementById("cscan");
  const lookCanvas = document.getElementById("look");
  const clookCanvas = document.getElementById("clook");
  const fcfsLabel = document.getElementById("fcfsOver");
  const sstfLabel = document.getElementById("sstfOver");
  const scanLabel = document.getElementById("scanOver");
  const cscanLabel = document.getElementById("cscanOver");
  const lookLabel = document.getElementById("lookOver");
  const clookLabel = document.getElementById("clookOver");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const inputs = document.querySelectorAll("form input");
    const isEmptyInput = Array.from(inputs).some(
      (input) => input.value.trim() === ""
    );

    if (isEmptyInput) {
      alert("Please fill in all input fields.");
      return;
    }

    const direction = document.getElementById("direction").value;
    const requests = document
      .getElementById("requests")
      .value.split(",")
      .map(Number);
    const initial = parseInt(document.getElementById("initial").value, 10);
    const fcfs = calculateFCFS(requests, initial);
    drawGraph(fcfs.order, fcfsCanvas);
    fcfsLabel.innerHTML = `Overhead ${fcfs.overhead}`;

    const sstf = calculateSSTF(requests, initial);
    drawGraph(sstf.order, sstfCanvas);
    sstfLabel.innerHTML = `Overhead ${sstf.overhead}`;

    const scan = calculateSCAN(requests, initial, direction);
    drawGraph(scan.order, scanCanvas);
    scanLabel.innerHTML = `Overhead ${scan.overhead}`;

    const cscan = calculateCSCAN(requests, initial, direction);
    drawGraph(cscan.order, cscanCanvas);
    cscanLabel.innerHTML = `Overhead ${cscan.overhead}`;

    const look = calculateLOOK(requests, initial, direction);
    drawGraph(look.order, lookCanvas);
    lookLabel.innerHTML = `Overhead ${look.overhead}`;

    const clook = calculateCLOOK(requests, initial, direction);
    drawGraph(clook.order, clookCanvas);
    clookLabel.innerHTML = `Overhead ${clook.overhead}`;

    const content = document.getElementById("content");
    content.style.visibility = "visible";
  });
});
