/**
 * @module ajax.js
 * @author Kevin Shelley (krshelle@asu.edu)
 * @version 2018-12-01
 *
 * @fileoverview Uses AJAX to retrieve JSON packages from a defined API that
 * returns rooms, suspects and weapons in a game of clue.
 */

/**
 * Defines the server's root address and port number.
 * @constant
 * @example 'http://localhost:8088/'
 */
const HOST = 'http://localhost:8088/';

/**
 * Variable to hold the list of suspects retrieved from the server.
 * @member
 */
var suspects;
/**
 * Variable to hold the list of rooms retrieved from the server.
 * @member
 */
var rooms;
/**
 * Variable to hold the list of weapons retrieved from the server.
 * @member
 */
var weapons;

/**
 * Retrieves information from the server via its root endpoint and
 * displays it on the ajax.html web page. See the server 'clueService.js'
 * for more information about the root enpoint and the various responses
 * enabled by the server.
 * @function
 */
function displayActivity() {
  ajaxGet(''); // retrieve all info using the root endpoint of the server
}

/**
 * Sends an AJAX GET request to the server specified by the
 * {@link #host host url} and the parameter endpoint. If no information
 * is retrieved or the server returns an error, the error will be handled
 * by the appropriate {@link #handleError handleError} method.
 *
 * @param {string} endpoint The endpoint of the get request to the server.
 * @function
 */
function ajaxGet(endpoint) {
  console.log('Creating AJAX request to ' + HOST + endpoint);

  var request = getRequestObject();   // new HttpRequest instance
  request.open("GET", HOST + endpoint);
  request.setRequestHeader("Content-Type", "application/json");

  request.onreadystatechange = function() {
    handleResponse(request);    // uncomment to see state transitions
    if(request.readyState == 4) {
      // if status comes back as OK (200), return the resulting value
      if(request.status == 200) {
        let json = JSON.parse(request.responseText);  // parse JSON returned
        //console.log(JSON.stringify(json));  // uncomment to see result

        // based on the response, set the arrays
        if(json.suspects) {
          suspects = json.suspects;
          document.getElementById('suspects').innerHTML = suspects.join(', ');
        }

        if(json.rooms) {
          rooms = json.rooms;
          document.getElementById('rooms').innerHTML = rooms.join(', ');
        }

        if(json.weapons) {
          weapons = json.weapons;
          document.getElementById('weapons').innerHTML = weapons.join(', ');
        }

      // return error state if non-OK response
      } else {
        handleError(request);
      }
    }
  };

  request.send(null);
}

/**
 * Returns the AJAX object to enable async communication
 *  with the back-end server.
 *
 * @returns  The AJAX request object if the window enables it,
 *  null if the window does not support AJAX
 */
function getRequestObject() {
  if (window.XMLHttpRequest) {
    console.log('Requested XML HTTP object: Browser supports AJAX');
    return(new XMLHttpRequest());
  } else {
    console.log('Request XML HTTP object: Browser does not support AJAX');
    return(null);
  }
}

/**
 * Sends request status to the debugger to analyze
 *  the state of the request.
 *
 * @param {JSON} request The request object to the server.
 */
function handleResponse(request) {
  switch (request.readyState) {
  case 0:
      console.log('Request state [0: UNSENT]');
      break;
  case 1:
      console.log('Request state [1: OPENED]');
      break;
  case 2:
      console.log('Request state [2: HEADER RECEIVED]');
      break;
  case 3:
      console.log('Request state [3: LOADING]');
      break;
  case 4:
      console.log('Request state [4: COMPLETE] [status ' + request.status + ']');
      break;
  }
}

/**
 * Displays an error message based on the request returned by the
 * server. If no address is returned, then a 0 error is generated with
 * a default error description.
 *
 * @param {JSON} request The request object with the error information.
 * @function
 */
function handleError(request) {
  let errNo;
  let errDescription;

  // if no error was defined by the server, then no connection was made
  if(request.status == 0) {
    errNo = request.status;
    errDescription = 'Could not connect to the server. Please make sure the '
      + 'server is active and try again.';
  } else {
    let err = JSON.parse(request.responseText);
    errNo = err.error;
    errDescription = err.errDescription;
  }
  console.error('Error ' + errNo + ': ' + errDescription);
  document.body.innerHTML = '<h1>Error ' + errNo + '</h1>' + errDescription;
}
