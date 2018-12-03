# JavaScriptExamples
A collection of useful JavaScript snippets that go over major concepts in Node.js (and a little bit broader). Currently includes concepts such as:
- Promise/Async
- AJAX
- Fetch
# Documentation
Documentation for each of the example scripts described below can be located in the `docs/` folder under their names (i.e. *fetch.js* has its documentation in the *docs/fetch* folder.
# Examples
There are some scripts that are invoked via an HTML file (specifically the ones using AJAX/Fetch). The corresponding HTML file is the same name as its script. For example, there is a *ajax.html* an a corresponding *ajax.js*. The *ajax.js* script is invoked using the *ajax.html* file. All other scripts, such as *PromiseAsyncAwait.js* are invoked using node. Below are the specifics to each file:
## ajax
Asynchronous JavaScript and XML (AJAX) runs by sending requests to a server. For this example, the server *clueService.js* (see below) must be running in order to receive the AJAX request and return JSON packages. Once the server is running, simply open the *ajax.html* file and the JavaScript file will be invoked upon load.
## clueService.js
This script is an Express server (specific to node) that listens off port 8088 with a wildcard CORS policy (meaning it can accept traffic from any request) and returns JSON packages depending on the specified endpoint. This server is used for both *ajax* and *fetch*.
## fetch
Same exact example as *ajax* except it utilizes fetch, a more popular method of retrieving JSON data as AJAX is slowly being phased out. Compare the 2 side-by-side to see the difference.
## FetchWeather
Uses fetch to retrieve weather information from ![Apixu](www.apixu.com) weather service about 5 major cities. Information on each can be retrieved by selecting its name from the drop down. Note that for this example, you must enter your own key in order for the request to work. You can do so by setting the value of the `APIXU_KEY` constant located at the top. To get a key, register on the website.
## PromiseAsyncAwait
This displays the functionality of Promises and their use on async/await function methods. It shows 2 methods of invoking and using a Promise to block IO on the event queue.
