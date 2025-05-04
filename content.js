
// content.js
let settings = {
  hideLikes: true,
  priorityAccounts: []
};

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(['hideLikes', 'priorityAccounts'], function(data) {
    if (data.hideLikes !== undefined) {
      settings.hideLikes = data.hideLikes;
    }
    
    if (data.priorityAccounts) {
      settings.priorityAccounts = data.priorityAccounts;
    }
    
    // Apply settings to the page
    processNotifications();
  });
}

// Main function to process notifications
function processNotifications() {
  // Handle page changes via Mutation Observer
  const observer = new MutationObserver(mutations => {
    if (document.URL.includes('/notifications')) {
      filterNotifications();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Initial processing
  if (document.URL.includes('/notifications')) {
    filterNotifications();
  }
}

// Filter notifications
function filterNotifications() {
  // Check if we're on the notifications page
  if (!document.URL.includes('/notifications')) return;
  
  // Find notification timeline
  const notificationItems = document.querySelectorAll('[data-testid="cellInnerDiv"]');
  
  if (notificationItems.length === 0) return;
  
  // Process each notification
  notificationItems.forEach(notification => {
    // Skip if already processed
    if (notification.dataset.processed) return;
    notification.dataset.processed = 'true';
    
    const notificationText = notification.textContent.toLowerCase();
    const isLikeNotification = notificationText.includes('liked your') || 
                              notificationText.includes('liked a tweet you were mentioned in');
    
    // Handle like notifications
    if (settings.hideLikes && isLikeNotification) {
      notification.style.display = 'none';
      return;
    }
    
    // Check for priority accounts
    if (settings.priorityAccounts.length > 0) {
      // Check if notification is from a priority account
      const isPriority = settings.priorityAccounts.some(account => {
        const username = account.startsWith('@') ? account.substring(1) : account;
        return notificationText.includes(username.toLowerCase());
      });
      
      if (isPriority) {
        // Mark as priority
        notification.style.border = '2px solid #1da1f2';
        
        // Move to top if possible
        const parent = notification.parentNode;
        if (parent && parent.firstChild) {
          parent.insertBefore(notification, parent.firstChild);
        }
      }
    }
  });
}

// Listen for settings changes
chrome.storage.onChanged.addListener(function(changes) {
  if (changes.hideLikes) {
    settings.hideLikes = changes.hideLikes.newValue;
  }
  
  if (changes.priorityAccounts) {
    settings.priorityAccounts = changes.priorityAccounts.newValue;
  }
  
  // Re-process notifications with new settings
  processNotifications();
});

// Initialize
loadSettings();
