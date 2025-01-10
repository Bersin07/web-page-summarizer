// background.js

// Listener for extension actions or events
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed and background script loaded.");
  });
  
  // Listener to handle messages from other scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "log") {
      console.log("Background script received:", message.data);
      sendResponse({ status: "Logged in the background script" });
    }
  });
  