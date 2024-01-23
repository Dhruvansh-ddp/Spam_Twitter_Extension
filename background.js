chrome.runtime.onInstalled.addListener(() => {
  // Set the default state of the filter to 'off'
  chrome.storage.local.set({ filterEnabled: false });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background script", request);

  if (request.action === "toggleFilter") {
    // Implement the logic to handle the toggle
    if (request.filterEnabled) {
      filterTweetsByHashtagCount();
    } else {
      // Logic to show tweets again, if necessary
    }
  }
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "toggleFilter") {
//     // Relay the toggleFilter message to the active tab
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, request);
//     });
//   }
// });
