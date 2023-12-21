const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const topics = [
  "cat",
  "mouse",
  "horse",
  "umbrella",
  "car",
  "house",
  "banana",
  "book",
];
let currentTopicIndex = 0;

//const URL = "https://ba.media-information-design.be/1ba21-22/natan-verbeelen/www";
const URL = "http://localhost:3000";
function init() {
  setInstruction();
}

window.onload = function () {
  init();
  fetchDrawingsForCurrentTopic();
};

function setInstruction() {
  const instructionElement = document.getElementById("instruction");
  instructionElement.innerText = topics[currentTopicIndex];
}

init();

let isDrawing = false;

canvas.addEventListener("mousedown", () => {
  isDrawing = true;
});

canvas.addEventListener("mousemove", draw);

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  ctx.beginPath(); // Start a new path for the next drawing
});

function draw(e) {
  if (!isDrawing) return;

  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";

  ctx.lineTo(
    e.clientX - canvas.getBoundingClientRect().left,
    e.clientY - canvas.getBoundingClientRect().top
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(
    e.clientX - canvas.getBoundingClientRect().left,
    e.clientY - canvas.getBoundingClientRect().top
  );
}

function saveDrawing() {
  const drawingDataURL = canvas.toDataURL();
  console.log(drawingDataURL);
  console.log(drawingDataURL.split(",")[1]);
  fetch(
    `${URL}/save-drawing/${encodeURIComponent(topics[currentTopicIndex])}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: drawingDataURL.split(",")[1], // Remove "data:image/png;base64,"
    }
  )
    .then((response) => response.text())
    .then((message) => {
      alert(message);
      clearCanvas();
      goToNextTopic();
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error saving drawing.");
    });
}

function fetchDrawingsForCurrentTopic() {
  fetch(`${URL}/get-drawings/${encodeURIComponent(topics[currentTopicIndex])}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch drawings: ${response.statusText}`);
      }
      return response.json();
    })
    .then((drawings) => {
      // Handle the retrieved drawings
      const drawingsContainer = document.getElementById("drawingsContainer");

      // Clear previous drawings
      drawingsContainer.innerHTML = "";

      // Display each drawing in reverse order (from new to old)
      for (let i = drawings.length - 1; i >= 0; i--) {
        const drawing = drawings[i];
        const imageElement = document.createElement("img");
        imageElement.src = `data:image/png;base64,${drawing.drawing}`;
        imageElement.alt = drawing.filename;
        drawingsContainer.appendChild(imageElement);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error fetching drawings.");
    });
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearDrawing() {
  clearCanvas(); // Call the existing clearCanvas function
}

function goToNextTopic() {
  fetchDrawingsForCurrentTopic();
  currentTopicIndex = (currentTopicIndex + 1) % topics.length;
  setInstruction();
}
