const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path"); // Add this line
const app = express();
const port = 3000; // You can change this port if needed

app.use(bodyParser.text());
app.use(express.static(path.join(__dirname, "/public"))); // Serve static files from the root directory

app.post("/save-drawing/:category", (req, res) => {
  const category = req.params.category;
  const drawing = req.body;

  const folderPath = `./drawings/${category}`;
  const filePath = `${folderPath}/${Date.now()}.png`; // Save as PNG for canvas dataURL

  // Create the 'drawings' folder if it doesn't exist
  if (!fs.existsSync("./drawings")) {
    fs.mkdirSync("./drawings");
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  fs.writeFile(filePath, drawing, "base64", (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error saving drawing.");
    } else {
      res.status(200).send("Drawing saved successfully.");
    }
  });
});

// New GET endpoint to retrieve all images for a category
app.get("/get-drawings/:category", (req, res) => {
  const category = req.params.category;
  const folderPath = `./drawings/${category}`;

  // Check if the category folder exists
  if (!fs.existsSync(folderPath)) {
    res.status(404).send("Category not found.");
    return;
  }

  // Read all files in the category folder
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading drawings.");
      return;
    }

    // Read the contents of each file and send as an array
    const drawings = files.map((file) => {
      const filePath = path.join(folderPath, file);
      const drawing = fs.readFileSync(filePath, { encoding: "base64" });
      return { filename: file, drawing };
    });

    res.status(200).json(drawings);
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // Adjust the filename if your HTML file has a different name
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
