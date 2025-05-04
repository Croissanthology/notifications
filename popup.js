
// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const hideCheckbox = document.getElementById('hide-likes');
  const accountsContainer = document.getElementById('priority-accounts');
  const newAccountInput = document.getElementById('new-account');
  const addButton = document.getElementById('add-account');
  const saveButton = document.getElementById('save');
  const statusEl = document.getElementById('status');
  
  let priorityAccounts = [];
  
  // Load saved settings
  chrome.storage.sync.get(['hideLikes', 'priorityAccounts'], function(data) {
    if (data.hideLikes !== undefined) {
      hideCheckbox.checked = data.hideLikes;
    }
    
    if (data.priorityAccounts && data.priorityAccounts.length) {
      priorityAccounts = data.priorityAccounts;
      renderAccounts();
    }
  });
  
  // Add new account
  addButton.addEventListener('click', function() {
    const username = newAccountInput.value.trim();
    if (username) {
      // Ensure username starts with @
      const formattedUsername = username.startsWith('@') ? username : '@' + username;
      
      if (!priorityAccounts.includes(formattedUsername)) {
        priorityAccounts.push(formattedUsername);
        renderAccounts();
        newAccountInput.value = '';
      }
    }
  });
  
  // Save settings
  saveButton.addEventListener('click', function() {
    chrome.storage.sync.set({
      hideLikes: hideCheckbox.checked,
      priorityAccounts: priorityAccounts
    }, function() {
      statusEl.textContent = 'Settings saved!';
      setTimeout(() => {
        statusEl.textContent = '';
      }, 2000);
    });
  });
  
  // Render account list
  function renderAccounts() {
    accountsContainer.innerHTML = '';
    
    priorityAccounts.forEach(function(account, index) {
      const div = document.createElement('div');
      div.className = 'priority-account';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.value = account;
      input.readOnly = true;
      
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-btn';
      removeButton.textContent = 'X';
      removeButton.addEventListener('click', function() {
        priorityAccounts.splice(index, 1);
        renderAccounts();
      });
      
      div.appendChild(input);
      div.appendChild(removeButton);
      accountsContainer.appendChild(div);
    });
  }
});
