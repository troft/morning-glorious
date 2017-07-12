/************************* Weather Info Start ****************************************/
//used for weather 
var weather = require("Openweather-Node");
var stringify = require('json-stringify');
var weather = require('openweather-apis');

//weather variables 
var weatherinfo;
var weathertemp;



//sets up weather credentials 
weather.setAPPID("");
weather.setLang('en');
weather.setUnits('imperial');
//set the culture 
//weather.setCulture("fr");
//set the forecast type 
module.exports.getWeather = function () {
  return new Promise(function(resolve, reject){
      weather.getDescription(function(err, desc){
        //function= callback function (external api request)
        if(err) {
          reject(err);
        }
        else {
          console.log(desc);
          weatherinfo = desc;
          resolve(weatherinfo);
        }
    });
  });
}

// weather.getTemperature(tempretureSetter);

// var tempretureSetter= function(err, temp){
//      console.log(temp);
//     weathertemp = temp; 
// }
module.exports.getTemp = function () {
  return new Promise(function(resolve, reject){
    weather.getTemperature(function(err, temp){
      if(err){
        reject(err)
      }
      else{
        console.log(temp);
        weathertemp = temp;
        resolve(weathertemp);
      }
    });
  })
}

//weather.setForecastType("daily"); //or "" for 3 hours forecast

/************************* Weather Info End ******************************************/