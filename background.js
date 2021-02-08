// Help: https://developer.chrome.com/extensions/getstarted

// this variable will be initalized after every browser restart
let firstTime = true;

// this function should be called whenever a tab is updated. The goal is to log into a WinCC Unified website, but only once! (with next browser start it works again)
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // console.log(changeInfo);
  if (changeInfo.status == 'complete') {
    // console.log('page fully loaded');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // only care about wincc unified runtime websites
      if (firstTime && tabs.length && tabs[0].url.toLowerCase().endsWith('/webrh') && tabs[0].title === 'WinCC Unified') {
        // get the saved user name
        chrome.storage.sync.get('user', function (data) {
          if (!data.user) {
            data.user = 'UMCAdmin';
            chrome.storage.sync.set({ user: data.user });
          }
          // get the saved password
          chrome.storage.sync.get('pass', function (data2) {
            if (!data2.pass) {
              data2.pass = 'MySecretPassword';
              chrome.storage.sync.set({ pass: data2.pass });
            }
            // get the saved waiting time
            chrome.storage.sync.get('waitingTime', function (data3) {
              if (!data3.waitingTime) {
                data3.waitingTime = '5';
                chrome.storage.sync.set({ pass: data3.waitingTime });
              }
              const waitingTime = parseInt(data3.waitingTime, 10) * 1000;
              console.log('Login!' + waitingTime);
              firstTime = false; // autologin will only be made once, after logout and login it will not autologin! (with next browser start it works again) // be careful: removing the eventlistener here will remove it forever!
              // autologin script
              chrome.tabs.executeScript(
                tabs[0].id,
                {
                  code: `
                  // console.log('Login!');
                  setTimeout(function() {
                    var d = document.getElementsByTagName('iframe')[0].contentWindow.document;
                    var user = d.getElementById('username');
                    var pass = d.getElementById('password');
                    var btn = d.getElementById('loginFormSubmit');
                    user.value = '${data.user}';
                    pass.value = '${data2.pass}';
                    pass.dispatchEvent(new Event('input'));
                    btn.click();
                  }, ${waitingTime});
                `
              });
            });
          });
        });
      }
    });
  }
});
