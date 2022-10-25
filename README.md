How to create this browser extension
1. Develop the code (most important is the manifest.json and the background.js)
2. Go to Chrome: Extensions
3. Enable "Developer mode" (right top corner)
4. Select the code folder by clicking on "Load unpacked" (left top corner)
5. Use the extension

How to use AutoLogOff and Login with user by URL:
1. Add a button with name "Logout" to your main start screen and make sure the button is always there (the button can also be outside the visible area of your screen).
2. Add an event to the button on left mouse click with system function "LogOff"
3. Download to runtime and add the credentials of the user in the browser URL, e.g.: https://winccunified/WebRH?user=UMCAdmin&password=Siemens123!

How to use Custom Login in TIA Portal:
0. make sure you set up AutoLogOff functionality
1. Add a new screen with at least these 3 items:
    a) io field with name "ioUsername" to input the new user that shall be logged in (connect a tag if needed)
    b) io field with name "ioPassword" to input the corresponding password (connect a tag if needed)
    c) button with name "btnLogin". Do not add any event to the button!
2. Add a button anywhere on one of your other screens and open the new screen by using the system function "OpenScreenAsPopup". The popup name (first parameter) must be "LoginDialog".
3. Download to runtime, open your login screen, insert your credentials and click on the login button

IO field with not readable password: *****
0. make sure you set up CustomLogin functionality
1. Add an io field with name "ioPasswordEditable" and set Miscellaneous -> React to input -> Hidden input to true
2. Add a tag to your new "ioPasswordEditable" and the same tag to your old "ioPassword"
3. Move "ioPassword" outside of the visible area of the screen (the code of this BrowserExtension can access it, but the Unified user does not see it.)
