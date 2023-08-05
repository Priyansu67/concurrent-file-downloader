# Concurrent File Downloader using Node.js and Next/React

This repository contains a simple web application built with Node.js and Next.js that allows users to download multiple files concurrently. The server utilizes worker threads to handle concurrent downloads and displays a progress bar for each download.

# Table of Contents

1. [Features](#features)
2. [Requirements](#requirements)
3. [How to Use](#how-to-use)
    1. [Clone the Repository](#clone-the-repository)
    2. [Install Dependencies](#install-dependencies)
    3. [Start the Applications](#start-the-applications)
    4. [Access the Application](#access-the-application)
4. [Usage](#usage)
    1. [Input URLs to Download](#input-urls-to-download)
    2. [Click the "SUBMIT" Button](#click-the-submit-button)
    3. [Monitor the Downloads](#monitor-the-downloads)
    4. [Test Links](#test-links)
5. [Notes](#notes)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend Implementation](#backend-implementation)
8. [Concurrency and Error Handling](#concurrency-and-error-handling)
9. [Challenges Faced](#challenges-faced)
10. [License](#license)
11. [Acknowledgments](#acknowledgments)

## Features

- Concurrent file downloads with a maximum limit on active downloads.
- Real-time progress bar for each download.
- Error handling for failed downloads.
- Support for adding multiple download URLs.
- Test links provided for easy testing of the application.

## Requirements

Make sure you have the following installed on your system:

- Node.js (version >= 14)
- npm (Node Package Manager)

## How to Use

1. Clone the repository to your local machine:

```
git clone https://github.com/Priyansu67/concurrent-file-downloader.git
cd concurrent-file-downloader
```

2. Install the dependencies for both the server and the client:

```
cd server
npm install

cd client
npm install
```

3. Start the server and client applications:

```
cd server
npm start

cd client
npm run dev
```

4. Access the application in your web browser by navigating to `http://localhost:3000`.

## Usage

1. Input URLs to download: Enter the URLs of the files you want to download in the input field. Click the "+" button to add more URLs.

2. Click the "SUBMIT" button: Once you have added all the URLs, click the "SUBMIT" button to start the downloads.

3. Monitor the downloads: The application will start downloading the files concurrently with a maximum limit on active downloads. You will see progress bars for each download, showing the download progress on the console of the server.

4. Test Links: You can also use the provided test links for easy testing of the application. Click the "Add" button next to each test link to add it to the url input bar.

## Notes

- The server limits the number of concurrent downloads to 2 by default (can be changed in the `maxConcurrentDownloads` variable).
- The server uses the `axios` library for downloading files.
- The frontend is built with Next.js designed using TailwindCSS and utilizes the `axios` library for making requests to the server.

## Frontend Implementation

The frontend of the application is implemented using Next.js. It provides a simple rough interface for users to input the URLs they want to download. The application performs URL validation. The frontend communicates with the backend API to submit the download requests.

## Backend Implementation

The backend of the application is built using Node.js, Express.js, and worker_threads. It exposes an API endpoint (`/api/download`) that accepts a list of URLs for downloading files. The backend limits the number of concurrent downloads to avoid overloading the server. It uses worker threads to perform the actual file downloads in a concurrent manner and shows the progress of each download using a console-based progress bar.

## Concurrency and Error Handling

The application effectively manages concurrency using worker threads. It limits the maximum number of concurrent downloads to 2 (configurable) to prevent performance issues. The application uses asynchronous programming to handle multiple download requests efficiently.

Error handling is implemented to gracefully handle download errors and network issues. If a download fails, the application logs an error message and continues processing the download queue.

## Challenges Faced

- Implementing efficient concurrency in Node.js using worker threads.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- The server implementation is inspired by [MultiBar](https://github.com/AndiDittrich/Node.CLI-Progress#multibar) from `cli-progress` npm package.
- The client-side design is inspired by me.
- This assignment was made for an interview.

This is just a dummy assignment so you don't have to contribute to the project or report any issues you encounter. Feel free to explore the code, test the application, and provide feedback. Happy coding! 🚀