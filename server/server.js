const express = require("express");
const { Worker } = require("worker_threads");
const fs = require("fs");
const cors = require("cors");
const cliProgress = require("cli-progress");

const app = express();
app.use(express.json());
app.use(cors());// Enable CORS to allow requests from the React app


const maxConcurrentDownloads = 2; //This will limit the number of concurrent downloads to 2
const downloadQueue = []; // This will hold the download queue
let activeDownloads = 0; //This will keep track of the number of active downloads

//Create a new progress bar instance from cli-progress npm package for console based progress bar
const multibar = new cliProgress.MultiBar(
  {
    stopOnComplete: true,
    clearOnComplete: true,
    barsize: 50,
    hideCursor: true,
    format: "{name} | {bar} | {value}/{total}%",
  },
  cliProgress.Presets.rect
);
const bars = {}; // This will hold the progress bar instances for each worker thread

const processDownloadQueue = () => {
  while (downloadQueue.length > 0 && activeDownloads < maxConcurrentDownloads) {
    const { url, destination } = downloadQueue.shift();
    activeDownloads++;

    const worker = new Worker("./worker.js", {
      eval: false,
      workerData: { url, destination },
    });

    if (!bars[worker.threadId]) {
      bars[worker.threadId] = multibar.create(100, 0, {
        filename: `Worker ${worker.threadId}`,
      });
    }

    worker.on("message", (message) => {
      bars[worker.threadId].start(100, 0, {
        name: `Worker ${worker.threadId}`,
      });
      if (message.progress !== undefined) {
        // update the progress bar
        bars[worker.threadId].update(message.progress);
      } else if (message.success) {
        bars[worker.threadId].update(100);
        //terminate the particular worker thread

        activeDownloads--;
      } else {
        // Log the error message
        console.error(
          `Worker ${worker.threadId}: File download failed for ${url}. Error: ${message.error}`
        );
        // Decrement the active downloads counter
        activeDownloads--;
      }
      processDownloadQueue(); // Continue processing the download queue
    });

    worker.on("error", (error) => {
      console.error("Worker error:", error);
      activeDownloads--;
      processDownloadQueue(); // Continue processing the download queue
    });
  }
  if (downloadQueue.length === 0 && activeDownloads === 0) {
    multibar.stop();
    console.log("All downloads completed.");
  }
};

app.post("/api/download", (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const destinationDir = "./downloads";
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);
  }

  urls.forEach((url, i) => {
    const destination = `${destinationDir}/file${i}:${new Date().getTime()}`;
    downloadQueue.push({ url, destination });
  });

  processDownloadQueue(); // Start processing the download queue
  res.json({ message: "Download added to the queue." });
});

const port = 3005;
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
