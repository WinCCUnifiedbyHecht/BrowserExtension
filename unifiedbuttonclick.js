var loginframe = document.getElementsByTagName('iframe')[0];
var d = loginframe.contentWindow.document;
var btn = d.getElementById('loginFormSubmit');
btn.click();
