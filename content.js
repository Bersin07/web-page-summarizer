// content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractText") {
        const text = document.body.innerText || document.body.textContent;
        sendResponse({ content: text });
    }
});
