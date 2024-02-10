console.log("Content script has loaded");

let filterEnabled = false; // State variable to track filter status
let videoCommentsEnabled = true; // State variable to track video comments visibility

// Function to initialize the script state based on saved toggle state
function initializeScriptState() {
  chrome.storage.local.get(
    ["filterEnabled", "videoCommentsEnabled"],
    (data) => {
      filterEnabled = data.filterEnabled || false;
      const videoCommentsEnabled = data.videoCommentsEnabled || false;
      if (filterEnabled) {
        filterTweetsByHashtagCount();
      }
      if (videoCommentsEnabled) {
        hideVideoComments();
      }
    }
  );
}

// Function to filter tweets based on hashtag count
function filterTweetsByHashtagCount() {
  const maxHashtags = 5; // Maximum number of hashtags allowed
  const tweets = document.querySelectorAll('div[data-testid="tweetText"]'); // Selector for tweet content

  tweets.forEach((tweetContent) => {
    const tweet = tweetContent.closest("article"); // Find the closest 'article' element
    if (tweet && hasTooManyHashtags(tweetContent, maxHashtags)) {
      tweet.style.display = "none"; // Hide the tweet
    }
  });
}

// Function to check if a tweet has more than a specified number of hashtags
function hasTooManyHashtags(tweetElement, maxHashtags) {
  const hashtags = tweetElement.querySelectorAll('a[href*="/hashtag/"]');
  return hashtags.length > maxHashtags;
}

// Function to toggle video comments visibility
function toggleVideoComments(visibility) {
  // Updated selector to target comments that include videos
  const videoComments = document.querySelectorAll(
    'article div[data-testid="videoComponent"]'
  );
  videoComments.forEach((videoComment) => {
    // Assuming the closest 'article' element to the video component is the comment container
    const commentContainer = videoComment.closest("article");
    if (commentContainer) {
      commentContainer.style.display = visibility ? "none" : "";
    }
  });
}

// Polling function to continuously check for tweets and video comments
function startPolling() {
  const pollInterval = 1; // 1 mili second

  setInterval(() => {
    if (filterEnabled) filterTweetsByHashtagCount();
    // Adjust the logic to check if videoCommentsEnabled is true to hide videos
    if (videoCommentsEnabled)
      toggleVideoComments(true); // Hides videos when button is on
    else toggleVideoComments(false); // Shows videos when button is off
  }, pollInterval);
}

// Message listener to handle messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleFilter") {
    filterEnabled = request.filterEnabled;
    chrome.storage.local.set({ filterEnabled: filterEnabled });
    if (filterEnabled) {
      filterTweetsByHashtagCount();
    }
  } else if (request.action === "toggleVideoComments") {
    videoCommentsEnabled = request.videoCommentsEnabled;
    chrome.storage.local.set({ videoCommentsEnabled: videoCommentsEnabled });
    toggleVideoComments(videoCommentsEnabled);
  }
});

initializeScriptState();
startPolling();
