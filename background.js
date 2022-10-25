// Help: https://developer.chrome.com/extensions/getstarted

// this variable will be initalized after every browser restart
let firstTime = true;

function startLoginObserver(tabs) {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: () => {
      var timerIdIntervalObserver = setInterval(() => {
        const desktopLayout = document.getElementById('ID_DesktopLayout');
        if (desktopLayout) {
          const popupAddedObserver = new MutationObserver(/** @param {MutationRecord[]} _event */ _event => {
            if (_event.length > 0 && _event[0].addedNodes.length > 0 && _event[0].addedNodes[0].dataset && _event[0].addedNodes[0].dataset.tifId === 'LoginDialog') {
              const timesIdIntervalButton = setInterval(() => {
                const loginButton = document.querySelector('[data-tif-id="btnLogin"]');
                if (loginButton) {
                  clearInterval(timesIdIntervalButton);
                  loginButton.addEventListener('pointerup', (e) => {
                    const ioUsername = document.querySelector('[data-tif-id="ioUsername"]');
                    const username = ioUsername.querySelector('input') ? ioUsername.querySelector('input').value : ioUsername.querySelector('text').innerHTML;
                    const ioPasswordEditable = document.querySelector('[data-tif-id="ioPasswordEditable"]');
                    const ioPassword = document.querySelector('[data-tif-id="ioPassword"]');
                    const password = ioPasswordEditable
                      ? (ioPasswordEditable.querySelector('input') ? ioPasswordEditable.querySelector('input').value : ioPassword.querySelector('text').innerHTML)
                      : (ioPassword.querySelector('input') ? ioPassword.querySelector('input').value : ioPassword.querySelector('text').innerHTML);
                    console.log('login with user: ' + username + ' and password: ' + password);
                    if (typeof (Storage) !== "undefined") {
                      // Store
                      localStorage.setItem("username", username);
                      localStorage.setItem("password", password);
                      //trigger logoff
                      var timerIdInterval2 = setInterval(function () {
                        var element = document.querySelector('[data-tif-id="Logout"]');
                        if (element) {
                          element.dispatchEvent(new PointerEvent('pointerdown'));
                          element.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse' }));
                          console.log('autologoff triggered');
                          clearInterval(timerIdInterval2);
                          clearTimeout(timerIdTimeout2);
                        }
                      }, 500);
                      var timerIdTimeout2 = setTimeout(function () {
                        console.log('abort autologoff');
                        clearInterval(timerIdInterval2);
                      }, 500);
                    } else {
                      console.log("Sorry, your browser does not support Web Storage...");
                    }
                  });
                }
              }, 500);
            }
          });
          popupAddedObserver.observe(desktopLayout, { childList: true });
          clearInterval(timerIdIntervalObserver);
          clearInterval(timerIdTimeoutObserver);
        }
      }, 500);
      var timerIdTimeoutObserver = setTimeout(() => {
        clearInterval(timerIdIntervalObserver);
      }, 30000);
    },
    args: [],
  });
}

/**
 * Logs into UMC. Always changes the page.
 * @param {Array<any>} tabs 
 * @param {string} user 
 * @param {string} password 
 * @param {number} maxWaitingTime 
 * @param {boolean} removeCredentialsFromUrl 
 * @param {boolean} noIFrame 
 */
function callUnifiedLogoutLogin(tabs, user, password, maxWaitingTime, removeCredentialsFromUrl = false, noIFrame = false) {
  firstTime = false; // autologin will only be made once, after logout and login it will not autologin! (with next browser start it works again) // be careful: removing the eventlistener here will remove it forever!
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: (tabs, username, password, maxWaitingTime, removeCredentialsFromUrl, noIFrame) => {
      var timerIdInterval2 = setInterval(function () {
        var element = document.querySelector('[data-tif-id="Logout"]');
        if (element) {
          element.dispatchEvent(new PointerEvent('pointerdown'));
          element.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse' }));

          console.log('autologoff triggered');
          clearInterval(timerIdInterval2);
          clearTimeout(timerIdTimeout2);
        }
      }, 500);
      var timerIdTimeout2 = setTimeout(function () {
        console.log('abort autologoff');
        clearInterval(timerIdInterval2);
      }, maxWaitingTime);

      var timerIdInterval = setInterval(function () {
        let d;
        if (noIFrame) {
          d = document;
        }
        else {
          var loginframe = document.getElementsByTagName('iframe')[0];
          if (loginframe) {
            d = loginframe.contentWindow.document;
          }
        }
        if (d) {
          //in future check if all elements are loaded, too
          var user = d.getElementById('username');
          var pass = d.getElementById('password');
          var btn = d.getElementById('loginFormSubmit');
          user.value = username;
          pass.value = password;
          if (removeCredentialsFromUrl) { // must be done exactly before logging in. In case the logout did not happen yet, the credentials will get lost
            window.history.pushState('object or string', tabs[0].title, tabs[0].url.split('?').shift()); // remove the credentials from URL without refreshing the page
          }
          pass.dispatchEvent(new Event('input'));

          const s = document.createElement('script');
          if (noIFrame) {
            s.setAttribute('src', chrome.runtime.getURL('unifiedIPbuttonclick.js'));
            document.documentElement.appendChild(s);
          }
          else {
            s.setAttribute('src', chrome.runtime.getURL('unifiedbuttonclick.js'));
            document.documentElement.appendChild(s);
          }
          console.log('autologin triggered')
          clearInterval(timerIdInterval);
          clearTimeout(timerIdTimeout);

          //stop logout
          clearInterval(timerIdInterval2);
          clearTimeout(timerIdTimeout2);
        }
      }, 500);
      var timerIdTimeout = setTimeout(function () {
        console.log('abort autologin');
        clearInterval(timerIdInterval);
      }, maxWaitingTime);
    },
    args: [tabs, user, password, maxWaitingTime, removeCredentialsFromUrl, noIFrame]
  });
}

// this function should be called whenever a tab is updated. The goal is to log into a WinCC Unified website, but only once! (with next browser start it works again)
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // console.log(changeInfo);
  if (changeInfo.status == 'complete') {
    // console.log('page fully loaded');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // only care about wincc unified runtime websites
      let appType = 0; //1 - Unified PC RT | 2 - VoT
      const urlPartAfterIp = tabs[0].url.toLowerCase().split('/')[3];
      if (urlPartAfterIp.startsWith('webrh') && tabs[0].title === 'WinCC Unified RT') {
        appType = 1; //Unified PC RT has been found

      } else if (tabs[0].url.toLowerCase().endsWith('/index.html') && tabs[0].title === 'WinCC Unified View-of-Things') {
        appType = 2; //WinCC Unified View-of-Things Application has been found
      }
      else if (urlPartAfterIp.startsWith('umc-idp') && tabs[0].title === 'Login') {
        appType = 3; //Login Page UMC
      }
      else if (urlPartAfterIp.startsWith('umc') && (tabs[0].title === 'User Management Control' || tabs[0].title === 'User Management Component')) {
        appType = -1; //UMC
      }
      console.log(urlPartAfterIp);
      console.log(tabs[0].title);
      if (appType > 0) {
        startLoginObserver(tabs);
        chrome.storage.sync.get('waitingTime', function (data) {
          if (!data.waitingTime) {
            // get the saved waiting time
            data.waitingTime = '5';
            chrome.storage.sync.set({ waitingTime: data.waitingTime });
          }
          const waitingTime = parseInt(data.waitingTime, 10) * 1000;
          //login with data stored in URL
          if (appType === 1 && urlPartAfterIp.includes('user=') && urlPartAfterIp.includes('password=')) {
            const urlVars = {};
            tabs[0].url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
              urlVars[key] = value;
            });
            callUnifiedLogoutLogin(tabs, urlVars.user, urlVars.password, waitingTime, true);
          }
          //login with data stored in session
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              return [localStorage.getItem("username"), localStorage.getItem("password")];
            }
          }, (injectionResult) => {
            const result = injectionResult[0].result;
            const username = result[0];
            const pass = result[1];
            if (appType === 1 && username != "null" && pass != "null") {
              callUnifiedLogoutLogin(tabs, username, pass, waitingTime);
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: function () {
                  localStorage.setItem("username", null);
                  localStorage.setItem("password", null);
                },
              });
            }
            //login with data from extension
            else if (firstTime) {
              // get the saved password
              chrome.storage.sync.get('pass', function (data2) {
                if (!data2.pass) {
                  data2.pass = 'MySecretPassword';
                  chrome.storage.sync.set({ pass: data2.pass });
                }
                const password = data2.pass;
                // get the saved user name
                chrome.storage.sync.get('user', function (data3) {
                  if (!data3.user) {
                    data3.user = 'UMCAdmin';
                    chrome.storage.sync.set({ user: data3.user });
                  }
                  const user = data3.user;
                  console.log('Login!' + waitingTime);
                  // autologin script
                  switch (appType) {
                    case 1: // WinCC Unified PC Runtime V17

                      chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: () => {
                          return new Promise((resolve, reject) => {
                            var i = 0;
                            var waitingInterval = setInterval(function () {
                              i++;
                              if (i > 100) {
                                reject();
                              }
                              if (document.getElementsByTagName('iframe')[0] && document.getElementsByTagName('iframe')[0].src) {
                                clearInterval(waitingInterval);
                                var iframeUrl = document.getElementsByTagName('iframe')[0].src;
                                //localStorage.setItem("iframeUrl", iframeUrl);

                                if (iframeUrl.toLowerCase().split('/').slice(0, 3).join('/') == document.URL.toLowerCase().split('/').slice(0, 3).join('/')) {
                                  resolve(true);
                                }
                                else {
                                  window.open(iframeUrl.toLowerCase().split('/').slice(0, 3).join('/') + "/umc", "_self");
                                  resolve(false);
                                }
                              }
                            }, 100);

                          });
                        },
                        args: [],
                      }, (injectionResult) => {
                        const result = injectionResult[0].result;
                        var fullUrl = tabs[0].url;
                        chrome.storage.sync.set({ "fullUrl": fullUrl });
                        if (result) {
                          callUnifiedLogoutLogin(tabs, user, password, waitingTime);
                        }
                      });

                      break;

                    case 2: // WinCC Unified View-of-Things
                      chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: (username, password, waitingTime) => {
                          console.log('Login!');
                          setTimeout(function () {
                            var d = document.getElementById('login');
                            var testtest = document.getElementById('user');
                            var user = document.getElementById('user');
                            var pass = document.getElementById('pass');
                            var btn = document.getElementById('loginbutton');
                            if (typeof (Storage) !== "undefined") {

                              console.log(localStorage.getItem("username"));
                            } else {
                              console.log("Sorry, your browser does not support Web Storage...");
                            }
                            user.value = username;
                            pass.value = password;
                            pass.dispatchEvent(new Event('input'));

                            const s = document.createElement('script');
                            s.setAttribute('src', chrome.runtime.getURL('votbuttonclick.js'));
                            document.documentElement.appendChild(s);

                          }, waitingTime);
                        },
                        args: [user, password, waitingTime]
                      });
                      break;


                    case 3:
                      callUnifiedLogoutLogin(tabs, user, password, waitingTime, false, true);

                      break;

                    default:
                      break;
                  }
                });
              });
            }
          });
        });
      }
      else if (appType === -1) {
        console.log("case -1");
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            console.log("hi")
            waitingInterval = setInterval(function () {
              if (document.getElementById('welcome-area')) {
                console.log("welcome area")
                clearInterval(waitingInterval);
                chrome.storage.sync.get("fullUrl", function (result) {
                  if (result.fullUrl) {
                    // localStorage.getItem("iframeUrl");
                    console.log(result.fullUrl);
                    chrome.storage.sync.set({ fullUrl: null });
                    window.open(result.fullUrl, "_self");
                  }
                });
              }
            }, 100)
          },
        });
      }
    });
  }
});
