/**
 * @fileoverview SER 421 Lab 7 Express Server API<p>
 * The API acts as a server that manages a Clue activity by returning
 * JSON packages of rooms, suspects and weapons.
 *
 * Body-parser referenced from:
 * {@link https://github.com/kgary/ser421public/blob/master/NodeExpress/express_post.js}
 *
 * @author Kevin Shelley (krshelle@asu.edu)
 * @version 2018-11-29
 * @module expressAPI.js
 */

/**
 * Import for the Express server API handler.
 * @member
 */
var express = require('express');
/**
 * Import for the body parser.
 */
var bParse = require('body-parser');
/**
 * Defines the Express server handler.
 */
var app = express();

// Express server settings.
app.use(bParse.urlencoded({ extended: true }));
app.use(bParse.json());
app.enable('trust proxy');  // enable scan of IP from req objects

/**
 * Port number the Express API listens on.
 * @constant
 * @example 8088
 */
const PORTNO = 8088;
/**
 * Turns the debugger on and off.
 * @constant
 * @example true
 */
const DEBUGON = true;

/**
 * List of all suspects.
 * @constant
 * @example ["Kevin Gary", "Tim Lindquist", "Srividya Bansal", "Alexandra Mehlhase",
 *  "Robert Heinrichs", "Ruben Acuna", "Ashraf Gaffar", "Javier Gonzalez-Sanchez",
 *  "Ajay Bansal", "Doug Sandy"]
 */
const suspects = ["Kevin Gary", "Tim Lindquist", "Srividya Bansal", "Alexandra Mehlhase", "Robert Heinrichs", "Ruben Acuna", "Ashraf Gaffar", "Javier Gonzalez-Sanchez", "Ajay Bansal", "Doug Sandy"];
/**
 * List of all rooms.
 * @constant
 * @example ["Student Union", "Classroom", "Slack", "Library", "Rec Center"]
 */
const rooms = ["Student Union", "Classroom", "Slack", "Library", "Rec Center"];
/**
 * List of all weapons.
 * @constant
 * @example ["Failing Grade", "Academic Status Report", "Baseball Bat", "Coffee Parrot", "Fiesta Parrot"]
 */
const weapons = ["Failing Grade", "Academic Status Report", "Baseball Bat", "Coffee Parrot", "Fiesta Parrot"];

// start listening for requests.
debug('Listening on port ' + PORTNO);
app.listen(PORTNO);

/**
 * Defines the header for an options request from the
 * browser. It defines the options and access permissions for the
 * client and a wildcard CORS policy.
 *
 * @param {string} Endpoint to mark middleware procedure for all
 *  requests to the server
 * @param {function} function Anonymous function to set header information
 * @function
 */
app.options("/*", function(req, res, next){
  debug('Preflight options request from ip [' + req.ip + ']');
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

/**
 * Sets the header for all response objects. The header allows for
 *  cross-origin reference from all hosts and defines the
 *  content interaction to use JSON as GET/POST parameters
 *
 * @param {string} Endpoint to mark middleware procedure for all
 *  requests to the server
 * @param {function} function Anonymous function to set header information
 * @function
 */
app.all('/*', function(req, res, next) {
  //debug('Allowing cross-origin requests from local host');
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'x-requested-with');
  res.header('Content-Type', 'application/json');
  next()
});

/**
 * Returns all lists ({@link #suspects suspects}, {@link #rooms rooms},
 * {@link #weapons weapons}) in one JSON.
 *
 * @param {string} '/' Root enpoint URL
 * @param {function} function Anonymous function to set initial layout
 * @function
 */
app.get('/', function(req, res) {
  debug('/ root GET operation triggered');
  res.status(200);
	res.send(JSON.stringify({
    "suspects": suspects,
    "rooms": rooms,
    "weapons": weapons
  }));
});

/**
 * Defines the GET endpoint for the suspects operation. Suspects
 * are returned in a JSON format and are a list of all suspects
 * in the {@link #suspects suspects} list.
 *
 * @param {string} '/suspects' enpoint URL
 * @param {function} function Anonymous function to grab request/resource
 *  objects.
 * @function
 */
app.get('/suspects', function(req, res) {
  debug('/suspects GET operation triggered');
  res.status(200);
	res.send(JSON.stringify({"suspects": suspects}));
});

/**
 * Defines the GET endpoint for the rooms operation. Rooms
 * are returned in a JSON format and are a list of all rooms
 * in the {@link #rooms rooms} list.
 *
 * @param {string} '/rooms' enpoint URL
 * @param {function} function Anonymous function to grab request/resource
 *  objects.
 * @function
 */
app.get('/rooms', function(req, res) {
  debug('/rooms GET operation triggered');
  res.status(200);
	res.send(JSON.stringify({"rooms": suspects}));
});

/**
 * Defines the GET endpoint for the weapons operation. Weapons
 * are returned in a JSON format and are a list of all weapons
 * in the {@link #weapons weapons} list.
 *
 * @param {string} '/suspects' enpoint URL
 * @param {function} function Anonymous function to grab request/resource
 *  objects.
 * @function
 */
app.get('/weapons', function(req, res) {
  debug('/weapons GET operation triggered');
  res.status(200);
	res.send(JSON.stringify({"weapons": suspects}));
});

/**
 * Defines the generic endpoint for all other undefined URLs
 * on the current host. It returns a 404 error.
 *
 * @param {string} '/*' Wildcard enpoint URL
 * @param {function} function Anonymous function to return the
 *  generated 404 error
 * @function
 */
app.all('/*', function(req, res) {
  handleError(res, 404, "The page could not be found :(");
});

/**
 * Generic error handling method. See below example on how the
 * error message is returned.
 * @example {'error':###, 'errDescription':'Description of error'}
 *
 * @param {JSON} res The response data
 * @param {number} errNum The error number
 * @param {string} message Description of the error
 */
function handleError(res, errNum, message) {
  debug('Error [status : ' + errNum + ', description: ' + message + ']');
  res.status(errNum);
  let response = {
    "error" : errNum,
    "errDescription": message
  };
  res.send(JSON.stringify(response));
}

/**
 * Prints debug messages to the console (assuming
 * a console exists that console.log can print to).
 * Prints based on the value of {@link #debugon DEBUGON}.
 *
 * @param {string} message The message to print to the debugger
 */
function debug(message) {
  if(DEBUGON) {
    console.log('[DEBUG] ' + message);
  }
}
