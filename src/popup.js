document.addEventListener("DOMContentLoaded", function () {
  const filterToggle = document.getElementById("filterToggle");

  // Load the current state of the toggle
  chrome.storage.local.get("filterEnabled", function (data) {
    filterToggle.checked = !!data.filterEnabled;
  });

  // Save the state of the toggle
  filterToggle.addEventListener("change", function () {
    chrome.storage.local.set(
      { filterEnabled: filterToggle.checked },
      function () {
        // Send a message to the content script to update the filtering
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            console.log("Active tab:", tabs[0].url);

            chrome.tabs.sendMessage(tabs[0].id, {
              action: "toggleFilter",
              filterEnabled: filterToggle.checked,
            });
          }
        );
      }
    );
  });
});
