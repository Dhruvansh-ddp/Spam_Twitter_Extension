// // contentScript.js

// // // Function to send tweet data to the chatboard
// // function sendTweetToChatboard(tweetContent) {
// //   const chatInput = document.querySelector(
// //     'textarea[placeholder="Send a message."]'
// //   );
// //   const submitButton = document.querySelector('div > button[type="submit"]');

// //   chatInput.value = tweetContent + " some prompt"; // Set your tweet content and prompt
// //   submitButton.click(); // Simulate a click on the send button
// // }

// // // Function to monitor for responses in the chat
// // function monitorChatResponse() {
// //   const chatBoard = document.querySelector("chatboard-selector"); // Replace with actual selector of the chat area

// //   const observer = new MutationObserver((mutations) => {
// //     mutations.forEach((mutation) => {
// //       if (mutation.addedNodes.length > 0) {
// //         // Process the new messages
// //         // This is where you handle the chatboard's response
// //       }
// //     });
// //   });

// //   observer.observe(chatBoard, { childList: true, subtree: true });
// // }

// // Function to check if a tweet meets the filtering criteria
// async function shouldFilterTweet(tweetElement) {
//   // Implement your filtering logic here (e.g., check for excessive hashtags)
//   const isIrrelevant = await checkContextualRelevance(tweetElement.textContent);
//   return isIrrelevant;
// }

// // Function to extract tweet details
// function extractTweetDetails(tweet) {
//   const userName = tweet
//     .querySelector('[data-testid="User-Name"]')
//     .textContent.trim();
//   const userHandle = tweet
//     .querySelector('a[href*="/"][role="link"]')
//     .textContent.trim();
//   const tweetContent = tweet
//     .querySelector('[data-testid="tweetText"]')
//     .textContent.trim();
//   const tweetImage = tweet.querySelector('[data-testid="tweetPhoto"] img');
//   const tweetImageURL = tweetImage ? tweetImage.src : "";

//   return { userName, userHandle, tweetContent, tweetImageURL };
// }

// // Modified filterTweets to use extractTweetDetails
// async function filterTweets() {
//   const tweets = document.querySelectorAll("article"); // Selector for tweets
//   for (let tweet of tweets) {
//     const { userName, userHandle, tweetContent, tweetImageURL } =
//       extractTweetDetails(tweet);

//     // Check if the tweet meets the filtering criteria
//     if (await shouldFilterTweet(tweetContent)) {
//       tweet.style.display = "none"; // Hide tweets that meet the filtering criteria
//     } else {
//       // If the tweet doesn't meet the filtering criteria, you can choose to do something with it
//       // For example, sending it to the chatboard
//       sendTweetToChatboard(
//         `${userName} (${userHandle}): ${tweetContent} Image: ${tweetImageURL}`
//       );
//     }
//   }
// }

// // Observe the Twitter feed for new tweets and apply filtering
// const observer = new MutationObserver((mutations) => {
//   mutations.forEach((mutation) => {
//     if (mutation.addedNodes.length > 0) {
//       filterTweets(); // Apply filtering to new tweets
//     }
//   });
// });

// // Start observing the Twitter feed
// const feed = document.querySelector("section"); // Selector for the Twitter feed
// if (feed) {
//   observer.observe(feed, { childList: true, subtree: true });
// }

// // Listen for messages from the background script
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "toggleFilter") {
//     if (request.filterEnabled) {
//       filterTweets(); // Enable tweet filtering
//     } else {
//       // Show all tweets when the filter is disabled
//       document
//         .querySelectorAll("article")
//         .forEach((tweet) => (tweet.style.display = ""));
//     }
//   }
// });

// // Placeholder for NLP API integration
// async function checkContextualRelevance(tweetText) {
//   // Replace with API call logic
//   return false; // Example response
// }

// // Example usage: sending a test message to the chatboard
// sendTweetToChatboard("Testing tweet content");

// contentScript.js

console.log("Content script has loaded");

let filterEnabled = false; // State variable to track filter status

// Function to initialize the script state based on saved toggle state
function initializeScriptState() {
  chrome.storage.local.get("filterEnabled", (data) => {
    filterEnabled = data.filterEnabled || false;
    if (filterEnabled) {
      filterTweetsByHashtagCount();
    }
  });
}

// Function to check if a tweet has more than a specified number of hashtags
function hasTooManyHashtags(tweetElement, maxHashtags) {
  // Assuming hashtags are contained within 'a' tags inside the tweet content
  const hashtags = tweetElement.querySelectorAll('a[href*="/hashtag/"]');
  return hashtags.length > maxHashtags;
}

// Function to filter tweets based on hashtag count
function filterTweetsByHashtagCount() {
  if (!filterEnabled) return; // Only apply filtering if enabled

  const maxHashtags = 5; // Maximum number of hashtags allowed
  const tweets = document.querySelectorAll('div[data-testid="tweetText"]'); // Selector for tweet content

  tweets.forEach((tweetContent) => {
    const tweet = tweetContent.closest("article"); // Find the closest 'article' element to the tweet content
    if (tweet && hasTooManyHashtags(tweetContent, maxHashtags)) {
      tweet.style.display = "none"; // Hide the entire tweet
    }
  });
}

// Polling function to continuously check for tweets
function startPolling() {
  const pollInterval = 1000; // 2 seconds

  setInterval(() => {
    filterTweetsByHashtagCount();
  }, pollInterval);
}

initializeScriptState();

// Observe the Twitter feed for new tweets and apply filtering
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      mutation.addedNodes.forEach((node) => {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          node.matches('div[data-testid="cellInnerDiv"]')
        ) {
          console.log("New nodes added:", mutation.addedNodes);
          filterTweetsByHashtagCount();
        }
      });
    }
  }
});

// Start observing the Twitter feed
const feed = document.querySelector(
  "section[aria-labelledby*='accessible-list']"
); // Selector for the Twitter feed
if (feed) {
  observer.observe(feed, { childList: true, subtree: true });
}

// Message listener to handle messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleFilter") {
    filterEnabled = request.filterEnabled;
    if (filterEnabled) {
      filterTweetsByHashtagCount();
    } else {
      // Logic to un-hide tweets or reset the filter when it's disabled
      const tweets = document.querySelectorAll('div[data-testid="tweetText"]');
      tweets.forEach((tweetContent) => {
        const tweet = tweetContent.closest("article");
        if (tweet) {
          tweet.style.display = ""; // Show the tweet
        }
      });
    }
  }
});

// Initial filtering when the script loads
// filterTweetsByHashtagCount();
startPolling();
