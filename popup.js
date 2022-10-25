const userInput = document.getElementById('user');
const passInput = document.getElementById('pass');
const waitingTimeInput = document.getElementById('waitingtime');

chrome.storage.sync.get('user', function (data) {
  if (!data.user) {
    data.user = 'UMCAdmin';
    chrome.storage.sync.set({ user: data.user });
  }
  userInput.value = data.user;
});
userInput.onchange = function(newval) {
  chrome.storage.sync.set({ user: userInput.value });
}
chrome.storage.sync.get('pass', function (data) {
  if (!data.pass) {
    data.pass = 'MySecretPassword';
    chrome.storage.sync.set({ pass: data.pass });
  }
  passInput.value = data.pass;
});
passInput.onchange = function(newval) {
  chrome.storage.sync.set({ pass: passInput.value });
}
chrome.storage.sync.get('waitingTime', function (data) {
  if (!data.waitingTime) {
    data.waitingTime = '5';
    chrome.storage.sync.set({ waitingTime: data.waitingTime });
  }
  waitingTimeInput.value = data.waitingTime;
});
waitingTimeInput.onchange = function(newval) {
  chrome.storage.sync.set({ waitingTime: waitingTimeInput.value });
}
