const { parentPort, workerData } = require("worker_threads");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const db = require("mime-db");

// This function will download the file from the url and save it to the destination received from the parent thread as workerData
const downloadFile = async (url, destination) => {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer", // This is important, otherwise the downloaded data will be in text format instead of binary
      onDownloadProgress: (progressEvent) => { // This is the progress callback of axios which will be called for every progress update
        let percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );// Calculate the percentage of the download completed to update the progress to the parent thread
        parentPort.postMessage({ progress: percentCompleted }); // Send the progress to the parent thread
      },
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to download file from ${url}. Status: ${response.status}`// Throw an error if download fails
      );
    }

    const contentType = response.headers["content-type"];// Extract the content type from the response headers
    
    // Extract the file extension from the mime-db using the content type if it exists
    const fileExt = db[`${contentType}`]
      ? db[`${contentType}`].extensions[0]
      : ""; //Don't use the file extension if it doesn't exist in the mime-db
    
    const contentDisposition = response.headers["content-disposition"];

    const finalFileExtension = fileExt //Check if we got the file extension from the mime-db
      ? "." + fileExt
      : path.extname(contentDisposition || url) || ""; // If not then xtract the file extension from the content disposition header or the url or use an empty extension

    const destinationAndFilenameWithExtension = destination + finalFileExtension;// Append the extracted file extension to the destination path received from the parent thread

    fs.writeFileSync(destinationAndFilenameWithExtension, response.data); // Write the downloaded data to the file

    parentPort.postMessage({ success: true }); // Send a success message to the parent thread
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message }); // Send an error message to the parent thread
  }
};

downloadFile(workerData.url, workerData.destination);// Call the downloadFile function with the url and destination received from the parent thread