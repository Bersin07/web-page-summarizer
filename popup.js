document.getElementById("summarize-btn").addEventListener("click", () => {
    const loadingDiv = document.getElementById("loading");
    const summaryDiv = document.getElementById("summary");
    const errorDiv = document.getElementById("error");

    // Clear previous messages
    summaryDiv.style.display = "none";
    errorDiv.style.display = "none";
    loadingDiv.style.display = "block";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.scripting.executeScript(
            {
                target: { tabId: activeTab.id },
                files: ["content.js"],
            },
            () => {
                chrome.tabs.sendMessage(activeTab.id, { action: "extractText" }, (response) => {
                    if (response && response.content) {
                        fetch("http://127.0.0.1:5000/summarize", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: response.content }),
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                loadingDiv.style.display = "none";
                                if (data.summary) {
                                    summaryDiv.style.display = "block";
                                    summaryDiv.innerText = data.summary;
                                } else {
                                    errorDiv.style.display = "block";
                                    errorDiv.innerText = "No summary was generated.";
                                }
                            })
                            .catch((error) => {
                                loadingDiv.style.display = "none";
                                errorDiv.style.display = "block";
                                errorDiv.innerText = "Error: " + error.message;
                            });
                    } else {
                        loadingDiv.style.display = "none";
                        errorDiv.style.display = "block";
                        errorDiv.innerText = "Could not extract text from the page.";
                    }
                });
            }
        );
    });
});
