/**
 * @module fetch.js
 * @author Kevin Shelley (krshelle@asu.edu)
 * @version 2018-12-01
 *
 * @fileoverview Uses Fetch to retrieve JSON packages from a defined API that
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
 * displays it on the fetch.html web page. See the server 'clueService.js'
 * for more information about the root enpoint and the various responses
 * enabled by the server.
 * @function
 * @async
 */
async function displayActivity() {
  try {
      let response = await fetchClue(HOST, ''); // retrieve all info using the root endpoint of the server

      // set clue variables with retrieve info
      suspects = response.suspects;
      rooms = response.rooms;
      weapons = response.weapons;

      // set values on web page
      document.getElementById('suspects').innerHTML = suspects.join(', ');
      document.getElementById('rooms').innerHTML = rooms.join(', ');
      document.getElementById('weapons').innerHTML = weapons.join(', ');
  } catch (e) {
    if(e.message === 'NetworkError when attempting to fetch resource.') {
      handleError({'error':0, 'errDescription':e.message});
    } else {
      console.error('Exception', e.errno, ':', e.message);
    }
  }
}

/**
 * Sends a fetch request to the server to retrieve the necessary
 * data. Fetch requests are made to the {@link #host host} at a
 * specified endpoint. See the 'clueService.js' server for information
 * about the different enpoints.
 *
 * @param {string} host The host and port number to send the request to.
 * @param {string} endpoint The endpoint of the get request on the server.
 * @returns {Promise} A Promise with the retrieved JSON.
 * @function
 */
function fetchClue(host, endpoint) {
  let url = host + endpoint;
  console.log('Fetch request made: ' + url);

  // fetch JSON from root
  return fetch(url)             // create the fetch Promise object.
  .then((resp) => resp.json())  // make the response a JSON.
  .then(function(data) {        // read and return the data

    if(data.error) handleError(data); // if there is a non-200 status, handle it
    else return data; // if returned data, return the Promise with the data

  })
}

/**
 * Displays an error message based on the request returned by the
 * server. If no address is returned, then a 0 error is generated with
 * a default error description.
 *
 * @param {JSON} error The request object with the error information.
 * @function
 */
function handleError(error) {
  console.error('Error ' + error.error + ': ' + error.errDescription);
  document.body.innerHTML = '<h1>Error ' + error.error + '</h1>' + error.errDescription;
}
