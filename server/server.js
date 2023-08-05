const express = require("express");
const { Worker } = require("worker_threads");
const fs = require("fs");
const cors = require("cors");
const cliProgress = require("cli-progress");

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS to allow requests from the React app

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
    format: "{filename} | {bar} | {value}/{total}%",
  },
  cliProgress.Presets.rect
);
const bars = {}; // This will hold the progress bar instances for each worker thread

// This function will process the download queue and start the download
const processDownloadQueue = () => {
  // Check if the download queue is empty and the number of active downloads is less than the maximum concurrent downloads
  while (downloadQueue.length > 0 && activeDownloads < maxConcurrentDownloads) {
    const { url, destination } = downloadQueue.shift(); // Get the first item from the download queue and remove it from the queue
    activeDownloads++; // Increment the active downloads counter because we are starting a new download

    // Create a new worker thread and use the workerCode from the worker.js file
    const worker = new Worker("./worker.js", {
      eval: false,
      // Pass the url and destination to the worker thread using the workerData property
      workerData: { url, destination },
    });

    // Create a new progress bar instance for the worker thread with the threadId as the key
    if (!bars[worker.threadId]) {
      bars[worker.threadId] = multibar.create(100, 0, {
        filename: `Worker ${worker.threadId}`,
      });
    }

    // Listen for messages from the worker thread
    worker.on("message", (message) => {
      bars[worker.threadId].start(100, 0, {
        filename: `Worker ${worker.threadId}`,
      }); //Start the progress bar when the worker thread sends a message

      //If the message contains the progress property, update the progress bar
      if (message.progress !== undefined) {
        bars[worker.threadId].update(message.progress); // Update the progress bar with the progress value sent by the worker thread
      } else if (message.success) {
        bars[worker.threadId].update(100);// Update the progress bar to 100% when the download is completed
        activeDownloads--; // Decrement the active downloads counter to give space for new downloads
      } else {
        // Log the error message when the download fails
        console.error(
          `Worker ${worker.threadId}: File download failed for ${url}. Error: ${message.error}`
        );
        activeDownloads--; // Decrement the active downloads counter to give space for new downloads on error
      }
      processDownloadQueue(); // Continue processing the download queue
    });

    // Listen for errors from the worker thread
    worker.on("error", (error) => {
      console.error("Worker error:", error);// Log the error message when the worker thread throws an error
      activeDownloads--;// Decrement the active downloads counter to give space for new downloads on error
      processDownloadQueue(); // Continue processing the download queue
    });
  }
  // Stop the progress bar when the download queue is empty and there are no active downloads
  if (downloadQueue.length === 0 && activeDownloads === 0) {
    multibar.stop();// Stop the progress bar
    console.log("All downloads completed.");// Log a message to the console to indicate that all downloads are completed
  }
};

app.post("/api/download", (req, res) => {
  const { urls } = req.body;// Get the urls array from the request body
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: "Invalid request body." });// Return an error response if the urls array is not present in the request body or if it is not an array
  }

  const destinationDir = "./downloads";// Name of the directory where the files will be downloaded
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);// Create a new directory if it doesn't exist
  }

  urls.forEach((url, i) => {// Loop through the urls array
    const destination = `${destinationDir}/file${i}:${new Date().getTime()}`;// Create a unique file name for each download
    downloadQueue.push({ url, destination });// Add the download to the download queue
  });

  processDownloadQueue(); // Start processing the download queue
  res.json({ message: "Download added to the queue." });// Return a success response so that the client knows that the download has been added to the queue
});

const port = 3005;
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
