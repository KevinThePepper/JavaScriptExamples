/**
 * @module PromiseAsyncAwait.js
 * @author Kevin Shelley (krshelle@asu.edu)
 * @version 12/1/2018
 *
 * @fileoverview Displays the functionality of Promises and
 *  await/asynch method to create a synchronous environment
 * on the asynchronous event loop.
 */

/**
 * Required for file IO. Used to create file directories.
 * @member
 */
var fs = require('fs');

/**
 * Creates a directory with all users read/write/execute permissions.
 * Permissions are granted to allow the user to delete the folder after
 * executing this script.
 *
 * @param {string} dir The relative/absolute directory.
 * @returns A Promise object to create the directory and modify the permissions.
 * @function
 */
function makeDir(dir) {
  return new Promise(function(resolve, reject) {
    fs.mkdir(dir, function(err) {
      // return reject if there is an error creating the directory.
      if(err) reject(err);
      else {
        // ensure that the proper permissions are placed on the folder.
        fs.chmod(dir, 777, function(err) {
          if(err) reject(err);  // error changing folder permissions
          else resolve();       // folder created with appropriate permissions
        });
      }
    });
  });
}

// ================== PROMISE SYNCHRONOUS =======================

/**
 * Displays using the returned Promise from the {@link #makeDir makeDir}
 * method using the Promise object syntax. Creates a 'promises/' folder
 * with 3 sub-directories.
 * @function
 */
function createPromise() {
  makeDir('./promises')
    .then(() => { return makeDir('./promises/folder1') })
    .then(() => { return makeDir('./promises/folder1/folder2') })
    .then(() => { return makeDir('./promises/folder1/folder2/folder3') })
    .catch((err) => { handleError(err) })
}

createPromise();

// =============== ASYNCH AWAIT SYNCHRONOUS ===================

/**
 * Displays using the returned Promise from the {@link #makeDir makeDir}
 * method using await/async. Creates an 'async/' folder with 3 sub-directories.
 * @function
 * @async
 */
async function awaitAsynch() {
  try {
    const folder = await makeDir('./async');
    const folder1 = await makeDir('./async/folder1');
    const folder2 = await makeDir('./async/folder1/folder2');
    const folder3 = await makeDir('./async/folder1/folder2/folder3');
  } catch (e) {
    handleError(e);
  }
}

awaitAsynch();

// ==================== ERROR HANDLER ==========================

/**
 * Error handler for all exceptions caught.
 *
 * @param {exception} e The exception being thrown.
 * @function
 */
function handleError(e) {
  console.error('Error ' + e.errno + ': ' + e.message);
}
