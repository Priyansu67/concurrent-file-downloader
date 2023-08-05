"use client";
import { useState } from "react";
import axios, { AxiosError } from "axios";

export default function Home() {
  const [urls, setUrls] = useState<string[]>([""]); //Storing the URLs in the array
  const [isValid, setIsValid] = useState<boolean[]>([true]); //Storing the validity of the URLs in the array
  const [submitted, setSubmitted] = useState<boolean>(false); //Submitting the URLs to the backend and storing the response

  // Function to check if a URL is valid using regex from StackOverflow
  const isValidUrl = (url: string) => {
    const urlPattern =
      /^(http(s?):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
    return urlPattern.test(url);
  };

  const submitUrls = async () => {
    // Check and show which URL is invalid or empty by updating the isValid array
    urls.map((_, i) => {
      if (urls[i] === "" || !isValidUrl(urls[i])) {
        setIsValid((prev) => {
          const newIsValid = [...prev];
          newIsValid[i] = false;
          return newIsValid;
        });
        setUrls((prev) => {
          const newUrls = [...prev];
          newUrls[i] = "";
          return newUrls;
        });
      }
    });
    // Check if all URLs are valid and non-empty
    if (
      isValid.every((item) => item === true) &&
      urls.every((item) => item !== "")
    ) {
      try {
        // Send the URLs to the backend
        const response = await axios.post(
          "http://localhost:3005/api/download",
          { urls }
        );
        // Handle the response from the backend
        if (response.status === 200) {
          setIsValid((_) => [true]); // Reset the isValid array
          setUrls((_) => [""]); // Reset the urls array
          setSubmitted(true); // Set the submitted state to true
          alert("Download started successfully!"); // Show an alert
          setTimeout(() => {
            setSubmitted(false); // Reset the submitted state after 5 seconds
          }, 5000);
        }
      } catch (error) {
        const err = error as AxiosError; // Cast the error to AxiosError
        console.error("Error occurred during download:", err.message); // Log the error message
      }
    } else {
      // If any URL is invalid or empty, show an error
      console.error(
        "Invalid URLs found, please correct them before submitting."
      );
    }
  };

  // Function to add another URL input
  const addAnotherUrl = () => {
    setUrls((prev) => [...prev, ""]);
    setIsValid((prev) => [...prev, true]);
  };

  // Function to handle the onBlur event of the URL input
  const handleInputBlur = (i: number) => {
    // Update the isValid state
    setIsValid((prev) => {
      const newIsValid = [...prev];
      newIsValid[i] = isValidUrl(urls[i]);
      return newIsValid;
    });
  };

  // Test links to download
  const testLinks = [
    "https://github.com/yourkin/fileupload-fastapi/raw/a85a697cab2f887780b3278059a0dd52847d80f3/tests/data/test-5mb.bin",
    "https://sabnzbd.org/tests/internetspeed/50MB.bin",
    "https://speed.hetzner.de/100MB.bin",
    "https://speed.hetzner.de/1GB.bin",
  ];
  return (
    <main className="flex min-h-screen flex-col items-center">
      <h1 className="text-xl md:text-6xl font-bold text-center mt-24">
        Input URLs to Download
      </h1>

      <div className="w-full p-12 md:p-24">
        <label
          htmlFor="url-input"
          className="mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          URL Input
        </label>
        {urls.map((item, i) => (
          <input
            key={i}
            id="url-input"
            type="text"
            value={urls[i]}
            className={`mt-2 bg-gray-50 ring-0 focus:outline-none text-gray-900 text-sm rounded-lg w-full p-2.5 ${
              isValid[i]
                ? ""
                : "border-2 border-red-500 placeholder:text-red-500"
            }`}
            onFocus={(e) => e.target.select()}
            onBlur={() => handleInputBlur(i)}
            onChange={(e) => {
              setUrls((prev) => {
                const newUrls = [...prev];
                newUrls[i] = e.target.value;
                return newUrls;
              });
            }}
            placeholder={isValid[i] ? `URL ${i + 1}` : "Invalid URL"}
          />
        ))}
        {urls.length > 1 && (
          <button
            onClick={() => {
              setUrls((prev) => prev.slice(0, prev.length - 1));
              setIsValid((prev) => prev.slice(0, prev.length - 1));
            }}
            className=" text-sm rounded-lg py-2.5 px-1  hover:text-red-500"
          >
            Remove
          </button>
        )}

        <div className="flex justify-center items-center w-full mt-4 space-x-2">
          <button
            onClick={addAnotherUrl}
            className="w-1/2 bg-gray-50 ring-0 focus:outline-none text-gray-900 text-sm rounded-lg p-2.5 hover:bg-gray-300"
          >
            + Add
            <span className="hidden md:inline"> Another URL</span>
          </button>
          <button
            disabled={submitted}
            onClick={submitUrls}
            className="w-1/2 bg-blue-600 ring-0 focus:outline-none text-gray-100 text-sm rounded-lg p-2.5 "
          >
            {submitted ? "Submitted" : "Submit"}
          </button>
        </div>
      </div>
      <h3 className="text-xl md:text-xl font-bold text-center mb-4">
        Test Links
      </h3>
      <div className="text-sm md:text-base font-medium text-gray-900 dark:text-white flex flex-col gap-y-2">
        {testLinks.map((link, i) => (
          <div
            key={link}
            className="w-full flex justify-between items-center gap-x-2"
          >
            {i === 0
              ? "5MB Test File"
              : i === 1
              ? "50MB Test File"
              : i === 2
              ? "100MB Test File"
              : "1GB Test File"}
            <div className="flex justify-center items-center gap-x-2">
              <button
                onClick={() => {
                  setUrls((prev) => {
                    const newUrls = [...prev, link];
                    return newUrls;
                  });
                  setIsValid((prev) => [...prev, true]);
                }}
                className="bg-gray-50 ring-0 focus:outline-none text-gray-900 text-sm rounded-lg py-1.5 px-2 hover:bg-gray-300"
              >
                Add
              </button>
              <button
                onClick={() => window.navigator.clipboard.writeText(link)}
                className="bg-gray-50 ring-0 focus:outline-none text-gray-900 text-sm rounded-lg p-1.5 hover:bg-gray-300"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
