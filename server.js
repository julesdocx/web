const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, "public")));

// Create the 'content' directory if it doesn't exist
const contentDirectory = "content";
fs.mkdir(contentDirectory, { recursive: true })
  .then(() => console.log(`'${contentDirectory}' directory created.`))
  .catch((err) =>
    console.error(`Error creating '${contentDirectory}' directory:`, err)
  );

app.post("/writeFile", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required." });
  }

  const timestamp = new Date().toLocaleString().replace(/[/\\?%*:|"<>]/g, "-"); // Format timestamp to be file-safe
  const filename = `file_${timestamp}.txt`; // Unique filename based on timestamp
  const filePath = path.join(contentDirectory, filename);

  try {
    await fs.writeFile(filePath, content);
    res.status(200).json({ message: "File written successfully.", filename });
  } catch (error) {
    console.error("Error writing to file:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/listFiles", async (req, res) => {
  try {
    const files = await fs.readdir(contentDirectory);
    const fileDataPromises = files.map(async (file) => {
      const filePath = path.join(contentDirectory, file);
      const content = await fs.readFile(filePath, "utf-8");
      return { filename: file, content };
    });

    const fileData = await Promise.all(fileDataPromises);
    res.status(200).json({ files: fileData });
  } catch (error) {
    console.error("Error reading directory:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
