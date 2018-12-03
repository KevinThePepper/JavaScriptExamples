/**
 * Lab 5 activity 2 javascript template that
 *  defines the interaction between this client and the
 *  {@link www.apixu.com} weather API. It uses a series
 *  of real-time fetching methods and graphical information
 *  to display current weather information in a give set
 *  of regions using a dynamic table platform.<p>
 *
 * @author Kevin Shelley (krshelle@asu.edu)
 * @copyright 2018 Kevin Shelley (krshelle@asu.edu)
 * @version 2018-11-21
 * @module activity2.js
 */

/**
 * Turns the debugger on and off
 * @member
 */
const DEBUGON = true;
/**
 * Defines the name of the nearest city to current location
 * @member
 */
const NEAREST_CITY = 'Suntree';
/**
 * Key required to fetch weather data from {@link www.apixu.com Apixu}
 * @member
 */
const APIXU_KEY = '03c57756a24343359c6231446181811';
/**
 * Defines a list of cities to populate to the UI select box.
 * The cities can be selected and have their real-time
 * weather information fetched and displayed.
 * @member
 */
const INIT_CITIES = ['Paris', 'London', 'Dubai', 'Moscow', 'Rome'];
/**
 * Stores weather conditions and their corresponding descriptions,
 * codes, and other information (for complete listing of codes see
 * {@link http://www.apixu.com/doc/Apixu_weather_conditions.json Apixu weather conditions})
 * @member
 */
var weatherConditions = {};
/**
 * Stores the average temperature of the {@link #init_cities list of cities}
 * @member
 */
var average = 0.0;
/**
 * Stores the city name and temperature of the hottest city amongst
 * the {@link #init_cities list of cities}
 * @member
 */
var hottest = {
  "city" : "none",
  "temp" : undefined
};

/**
 * Sets the initial layout of the weather page by:
 * * Setting the average and hottest temperatures on page header
 * * Drawing and populating table information
 * * Setting 'Forecast' button event listeners
 * @function
 * @async
 */
async function setLayout() {
  // clear unnecessary sections
  let forecast = document.getElementById('forecast-info');
  forecast.innerHTML = '';
  // grab weather conditions
  fetchWeatherConditions();

  /* PHASE 1 - CLEAN AND POPULATE WEATHER TABLE */

  // populate the pick list values
  let select = document.getElementById('city-select');
  select.innerHTML = '';

  // iterate through initial cities list (INIT_CITIES)
  // Use iteration to also draw city values for the first line.
  for(let i in INIT_CITIES) {
    let city = INIT_CITIES[i];

    // create the drop down
    let option = document.createElement('option');
    select.appendChild(option);
    option.value = city;
    option.text = city;
  }

  try {
    // populate the table
    populateCity('closest-city-record', NEAREST_CITY, 'current');
    populateCity('select-city-record', getSelectedCity(), 'current');

    /* PHASE 2 - UPDATE AVERAGE TEMP AND HOTTEST CITY INFO */
    this.average = 0;
    // populate average temperature and hottest city
    for(let i in INIT_CITIES) {
      let city = INIT_CITIES[i];
      // determine average temperature and hottest city
      let response = await fetchCityAPI('current', city);

      let currTemp = response.current.temp_c;
      // add to average summation
      //debug('City ' + city + ' has a temperature of ' + currTemp);

      // compare current city to current hottest and
      // swap if current city is hottest
      if(currTemp > this.hottest.temp || !(this.hottest.temp)) {
        this.hottest.city = city;
        this.hottest.temp = currTemp;
      }

      // populate hottest and average
      this.average = this.average + (currTemp / INIT_CITIES.length);
      document.getElementById('city-averages-temp').innerHTML = this.average;
      document.getElementById('city-averages-hottest').innerHTML = this.hottest.city;
    }
    debug('Main page refreshed');

  } catch (e) {
    handleException(e);
  }
}

/**
 * @private
 * Keeps table integrity by keeping the order of the table
 * consistent between loads. Should have the nearest city
 * as the first record and the second as the drop-box value
 * @function
 */
 function keepTableIntegrity() {
   let r1 = document.getElementById('closest-city-record');
   let r2 = document.getElementById('select-city-record');
   r1.parentNode.insertBefore(r1, r2);
 }

/**
 * Populates the table with a city value using a series of
 * parameters to identify the correct table position
 *
 * @param {string} trId - The id of the 'tr' object in the city-table table
 * @param {string} city - The city to populate the record information with
 * @param {string} typeOfReport - Current or forecast report to pull from
 *  ther apixu weather API
 * @function
 * @async
 */
async function populateCity(trId, city, typeOfReport) {
  let response = await fetchCityAPI(typeOfReport, city);

  // clear unnecessary sections
  let forecast = document.getElementById('forecast-info');
  forecast.innerHTML = '';

  // add table values to the table
  let cityRecord = document.getElementById('city-table');
  let tr = document.getElementById(trId);
  tr.innerHTML = '';

  // if already populated, empty table record
  let cityTD = document.createElement('td');
  let timestampeTD = document.createElement('td');
  let tempTD = document.createElement('td');
  let windSpeedTD = document.createElement('td');
  let visibilityTD = document.createElement('td');
  let forecastTD = getForecastButtonstring(trId);
  forecastTD.addEventListener('click', function() { getForecast(trId) });

  cityRecord.appendChild(tr);
  tr.appendChild(cityTD);
  tr.appendChild(timestampeTD);
  tr.appendChild(tempTD);
  tr.appendChild(windSpeedTD);
  tr.appendChild(visibilityTD);
  tr.appendChild(forecastTD);

  cityTD.innerHTML = response.location.name;
  timestampeTD.innerHTML = response.location.localtime;
  windSpeedTD.innerHTML = response.current.wind_kph;
  visibilityTD.innerHTML = response.current.vis_km;

  // determine if feels-like is required
  let temp_c = response.current.temp_c;
  if(temp_c < 20) {
    temp_c = '' + temp_c + '<br>(Feels like ' +
      response.current.feelslike_c + ')';
  }
  tempTD.innerHTML = temp_c;

  debug('City information updated: ' + response.location.name);
  keepTableIntegrity();
}

/**
 * Defines the event listener for the select box,
 * which allows the user to select a value and the table
 * to reflect with the newly-chosen city information
 * @function
 */
function updateTableCity() {
  populateCity('select-city-record', getSelectedCity(), 'current');
}

/**
 * Fetches JSON data from the server based on the type of
 * report requested and the city.
 *
 * @param {string} typeOfReport - 'current' or 'forecast' report
 * @param {string} selectCity - The city being fetched
 * @returns The apixu JSON API as a Promise
 * @function
 */
function fetchCityAPI(typeOfReport, selectCity) {
  // convert report type and city into URL request
  let root = 'http://api.apixu.com/v1/';
  let report = typeOfReport + '.json';
  //let key = '?key=' + APIXU_KEY;
  let key = '?key=' + '03c57756a24343359c6231446181811';
  let city = '&q=' + selectCity;
  let url = root + report + key + city;

  // fetch JSON from root
  debug('Fetch request made: ' + url);
  return fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {

    //debug(JSON.stringify(data));
    if(data.error) handleError(data.error);
    else return data;

  })
}

/**
 * Fetches the apixu weather conditions with a list of
 * codes and their corresponding night/day descriptions. Drawn from
 * {@link http://www.apixu.com/doc/Apixu_weather_conditions.json}
 * @function
 */
function fetchWeatherConditions() {
  // convert report type and city into URL request
  let root = 'http://www.apixu.com/doc/';
  let report = 'Apixu_weather_conditions.json';
  let url = root + report;
  // fetch JSON from root
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    //debug(JSON.stringify(data));
    weatherConditions = data;
  })
  debug('Weather conditions API fetched: ' + url);
}

/**
 * Handles and displays errors if passed by the apixu JSON API
 *
 * @param {number} error - The JSON error object as a Promise
 * @function
 */
function handleError(error) {
  // comes in form: {"code":1005,"message":"API URL is invalid."}
  debug('Error handled: [' + error.code + ' - ' + error.message + ']');
  let status = getHTTPStatusCode(error.code);
  let line1 = '<h1>Error ' + status + '</h1><br>';
  let line2 = '<strong>[Code ' + error.code + ']</strong>: '+ error.message;
  document.body.innerHTML = line1 + line2;
}


function handleException(e) {
  console.error('Error', e.errno, ':', e.message);
}

/**
 * Returns the HTTP status code based on the error code
 * defined by the apixu error API. See:
 * {@link https://www.apixu.com/doc/errors.aspx}
 *
 * @param {number} code - The apixu error code
 * @returns The corresponding HTTP status code
 * @function
 */
function getHTTPStatusCode(code) {
  switch(code) {
    // returns 400 status
    case 1003:
    case 1005:
    case 1006:
    case 9999:
      return 400;
    // returns 401 status
    case 1002:
    case 2006:
      return 401;
    // returns 403 status
    case 2007:
    case 2008:
      return 403;
    // return default status of 500 if no response identified
    default:
      return 500;
  }
}

/**
 * onclick event listener for the 'Forecast' buttons
 * on the weather table.
 *
 * @param {string} trId - The id of the 'tr' to draw the city info from
 * @function
 */
function getForecast(trId) {
  // determine the city based on the index
  let city;
  if(trId == 'closest-city-record') {
    city = NEAREST_CITY;
  } else {
    city = getSelectedCity();
  }

  // send fetch request for forecast information
  fetchCityAPI('forecast', city).then( function(response) {
    if(response.error) {
      handleError(response.error);
    } else {
      let forecast = document.getElementById('forecast-info');
      forecast.innerHTML = '';

      debug('Forecast for ' + response.location.name +
        ' on day ' + response.forecast.forecastday[0].date);

      // populate forecast field
      setForecastField(response);
    }
  });
}

/**
 * Sets the forecast div ('forecast-info') using response data
 * generated from apixu
 *
 * @param {JSON} response - Forecast data fetched from apixu
 * @function
 */
function setForecastField(response) {
  // pull data from response object
  let city = response.location.name;
  let date = response.forecast.forecastday[0].date;
  let day = response.forecast.forecastday[0].day;
  let astro = response.forecast.forecastday[0].astro;

  // identify target regions to populate results
  let forecast = document.getElementById('forecast-info');

  // populate results
  forecast.innerHTML =
  "<h3>Forecast for <span id='city-forecast-name'>HHH</span> on\n" +
  "  <span id='city-forecast-date'>DDD</span>:</h3>\n" +
  "  <div id='forecast-day'>\n" +
  "    <h4>Day</h4>\n" +
  "    <strong>High: </strong><span id='maxtemp_c'></span>&#176;C\n" +
  "      (<span id='maxtemp_f'></span>&#176;F)<br>\n" +
  "    <strong>Low: </strong><span id='mintemp_c'></span>&#176;C\n" +
  "      (<span id='mintemp_f'></span>&#176;F)<br>\n" +
  "    <strong>Average: </strong><span id='avgtemp_c'></span>&#176;C\n" +
  "      (<span id='avgtemp_f'></span>&#176;F)<br>\n" +
  "    <strong>Max wind speed: </strong><span id='maxwind_kph'></span>KPH\n" +
  "      (<span id='maxwind_mph'></span>MPH)<br>\n" +
  "    <strong>Total </strong>precipitation: <span id='totalprecip_mm'></span>mm\n" +
  "      (<span id='totalprecip_in'></span>in)<br>\n" +
  "    <strong>Average Visibility: </strong><span id='avgvis_km'></span>km\n" +
  "      (<span id='avgvis_miles'></span>miles)<br>\n" +
  "    <strong>Average Humidity: </strong><span id='avghumidity'></span><br>\n" +
  "    <strong>Condition: </strong><span id='condition-text'></span>\n" +
  "  </div>\n" +
  "  <div id='forecast-astro'>\n" +
  "    <h4>Astro</h4>\n" +
  "    <strong>Sunrise: </strong><span id='sunrise'></span><br>\n" +
  "    <strong>Sunset: </strong><span id='sunset'></span><br>\n" +
  "    <strong>Moonrise: </strong><span id='moonrise'></span><br>\n" +
  "    <strong>Moonset: </strong><span id='moonset'></span><br>\n" +
  "  </div>"
  let forecastName = document.getElementById('city-forecast-name');
  let forecastDate = document.getElementById('city-forecast-date');
  let forecastDay = document.getElementById('city-forecast-day');
  let forecastAstr = document.getElementById('city-forecast-astro');

  forecastName.innerHTML = city;
  forecastDate.innerHTML = date;

  // day info
  document.getElementById('maxtemp_c').innerHTML = day.maxtemp_c;
  document.getElementById('maxtemp_f').innerHTML = day.maxtemp_f;
  document.getElementById('mintemp_c').innerHTML = day.mintemp_c;
  document.getElementById('mintemp_f').innerHTML = day.mintemp_f;
  document.getElementById('avgtemp_c').innerHTML = day.avgtemp_c;
  document.getElementById('avgtemp_f').innerHTML = day.avgtemp_f;
  document.getElementById('maxwind_kph').innerHTML = day.maxwind_kph;
  document.getElementById('maxwind_mph').innerHTML = day.maxwind_mph;
  document.getElementById('totalprecip_mm').innerHTML = day.totalprecip_mm;
  document.getElementById('totalprecip_in').innerHTML = day.totalprecip_in;
  document.getElementById('avgvis_km').innerHTML = day.avgvis_km;
  document.getElementById('avgvis_miles').innerHTML = day.avgvis_miles;
  document.getElementById('avghumidity').innerHTML = day.avghumidity;
  // write condition
  let currCondition = getWeatherCodeDescription(day.condition.code);
  document.getElementById('condition-text').innerHTML =
  "It will be " + currCondition.day + " during the day and <br>\n" +
    currCondition.night + " at night."

  // astro info
  document.getElementById('sunrise').innerHTML = astro.sunrise;
  document.getElementById('sunset').innerHTML = astro.sunset;
  document.getElementById('moonrise').innerHTML = astro.moonrise;
  document.getElementById('moonset').innerHTML = astro.moonset;
}

/**
 * Returns the corresponding weather code to the passed parameter.
 * The weather codes are drawn from:
 * {@link http://www.apixu.com/doc/Apixu_weather_conditions.json}
 *
 * @param {number} code - Weather status code
 * @returns JSON representation of the weather code. Null if there
 *  is no corresponding code in the apixu API
 * @function
 */
function getWeatherCodeDescription(code) {
  for(var c in weatherConditions) {
    if(weatherConditions[c].code == code) {
      return weatherConditions[c];
    }
  }
  debug('No weather condition found with code: ' + code);
  return null;
}

/**
 * Returns a button object to be inserted into the DOM
 *
 * @param {number} trId - id of 'tr' object to assign button method to
 * @returns A button object to be inserted into the DOM
 * @function
 */
function getForecastButtonstring(trId) {
  let button = document.createElement('input');
  button.type = 'button';
  button.value = 'Forecast';
  button.id = trId + '-input';
  button.onclick= 'getForecast(' + trId + ')';
  return button;
}

/**
 * Returns the selected city of the city-select drop down
 *
 * @returns the selected city of the city-select drop down
 * @function
 */
function getSelectedCity() {
  let select = document.getElementById('city-select');
  return select.options[select.selectedIndex].value;
}

/**
 * @private
 * Prints a debug message to the console, assuming there
 * is a target for console.log();
 *
 * @param {string} message - The message to print to the debugger
 * @function
 */
function debug(message) {
  if(DEBUGON) {
    console.log('[DEBUG] '+ message)
  }
}
