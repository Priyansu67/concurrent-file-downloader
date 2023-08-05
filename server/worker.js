const { parentPort, workerData } = require("worker_threads");
const axios = require("axios"); // Include axios in the worker thread
const fs = require("fs");
const path = require("path");
const db = require("mime-db");

const downloadFile = async (url, destination) => {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      onDownloadProgress: (progressEvent) => {
        let percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        parentPort.postMessage({ progress: percentCompleted });
      },
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to download file from ${url}. Status: ${response.status}`
      );
    }

    const contentType = response.headers["content-type"];
    const fileExt = db[`${contentType}`]
      ? db[`${contentType}`].extensions[0]
      : "";
    const contentDisposition = response.headers["content-disposition"];
    const fileExtension = fileExt
      ? "." + fileExt
      : path.extname(contentDisposition || url) || "";

    // Append the extracted file extension to the destination path
    const destinationWithExtension = destination + fileExtension;

    fs.writeFileSync(destinationWithExtension, response.data);

    parentPort.postMessage({ success: true });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
};
downloadFile(workerData.url, workerData.destination);
