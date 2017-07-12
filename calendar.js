/******************Google Calendar*************************************/
const {promisify} = require('util');
var fs = require('fs');
var readFileAsync = promisify(fs.readFile);
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  return readFileAsync(TOKEN_PATH)
  .then( token => {
    oauth2Client.credentials = JSON.parse(token);
    return oauth2Client;
  })
  .catch( err => {
    return getNewToken(oauth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client) {
  return new Promise(resolve, reject, function () {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        resolve(oauth2Client);
      });
    });
  })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}
/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

var calendarEventSentence;

var d = new Date(); 

var todayStartString;
var todayEndString;
var todayDate= (function(d){
  var year= d.getUTCFullYear();
  var day= d.getUTCDate();
  var datString
  if(day<10){
    dayString= '0'+day;
  }
  else{
    dayString = day;
  }
  var month = d.getUTCMonth()+1;
  var monthString;
  if(month<10){
    monthString='0'+month;
  }
  else{
    monthString = month;
  }
  console.log(year+ " " + monthString + " "+ dayString);
  todayStartString = year+'-'+monthString+'-'+dayString+'T00:00:00Z';
  console.log(todayStartString);
  todayEndString = year+'-'+monthString+'-'+dayString+'T23:59:59Z';
  console.log(todayEndString);
})

function listEvents(auth) {
  todayDate(d);

  var calendar = google.calendar('v3');
  var calendarListAsync = promisify(calendar.events.list);
  return calendarListAsync({
    auth: auth,
    calendarId: 'primary',
    timeMin: todayStartString,
    timeMax: todayEndString,
    // timeMin='2017-06-07T00:00:00Z', 
    // timeMax='2017-06-08T00:00:00Z',
    maxResults: 10,
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  })
  .then( response => {
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found.');
      calendarEventSentence='Your calendar is free today as you have no scheduled events.'
    } else {

      console.log('Upcoming ' + events.length+ ' events:');
      if(events.length>5){
        calendarEventSentence="You may need your morning coffee because you have " + events.length + " events today including "
      }
      else{
      calendarEventSentence="You have a pretty light day with " + events.length + " events today including "
        }
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        calendarEventSentence= calendarEventSentence + event.summary + ', ';
        console.log('%s - %s', start, event.summary);
      }
      console.log(calendarEventSentence);
      return calendarEventSentence
    }
  })
  .catch( err => {
    console.log('The API returned an error: ' + err);
    throw err;
  });
}


// Load client secrets from a local file.
module.exports.getCal = function(){
  return readFileAsync('client_secret.json')
  .then( content => {
    return authorize(JSON.parse(content));
  })
  .then(listEvents)
  .catch( err => {
    console.log('Error loading client secret file: ' + err);
    throw err
  });
}


/************************* End of Google Calendar ************************************/

// /******************Google Calendar*************************************/
// var fs = require('fs');
// var readline = require('readline');
// var google = require('googleapis');
// var googleAuth = require('google-auth-library');

// // If modifying these scopes, delete your previously saved credentials
// // at ~/.credentials/calendar-nodejs-quickstart.json
// var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
//     process.env.USERPROFILE) + '/.credentials/';
// var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

// // Load client secrets from a local file.
// fs.readFile('client_secret.json', function processClientSecrets(err, content) {
//   if (err) {
//     console.log('Error loading client secret file: ' + err);
//     return;
//   }
//   // Authorize a client with the loaded credentials, then call the
//   // Google Calendar API.
//   authorize(JSON.parse(content), listEvents);
// });
// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  *
//  * @param {Object} credentials The authorization client credentials.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// function authorize(credentials, callback) {
//   var clientSecret = credentials.installed.client_secret;
//   var clientId = credentials.installed.client_id;
//   var redirectUrl = credentials.installed.redirect_uris[0];
//   var auth = new googleAuth();
//   var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, function(err, token) {
//     if (err) {
//       getNewToken(oauth2Client, callback);
//     } else {
//       oauth2Client.credentials = JSON.parse(token);
//       callback(oauth2Client);
//     }
//   });
// }

// /**
//  * Get and store new token after prompting for user authorization, and then
//  * execute the given callback with the authorized OAuth2 client.
//  *
//  * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
//  * @param {getEventsCallback} callback The callback to call with the authorized
//  *     client.
//  */
// function getNewToken(oauth2Client, callback) {
//   var authUrl = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES
//   });
//   console.log('Authorize this app by visiting this url: ', authUrl);
//   var rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   });
//   rl.question('Enter the code from that page here: ', function(code) {
//     rl.close();
//     oauth2Client.getToken(code, function(err, token) {
//       if (err) {
//         console.log('Error while trying to retrieve access token', err);
//         return;
//       }
//       oauth2Client.credentials = token;
//       storeToken(token);
//       callback(oauth2Client);
//     });
//   });
// }

// *
//  * Store token to disk be used in later program executions.
//  *
//  * @param {Object} token The token to store to disk.
 
// function storeToken(token) {
//   try {
//     fs.mkdirSync(TOKEN_DIR);
//   } catch (err) {
//     if (err.code != 'EEXIST') {
//       throw err;
//     }
//   }
//   fs.writeFile(TOKEN_PATH, JSON.stringify(token));
//   console.log('Token stored to ' + TOKEN_PATH);
// }
// /**
//  * Lists the next 10 events on the user's primary calendar.
//  *
//  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//  */

// var calendarEventSentence;

// var d = new Date(); 

// var todayStartString;
// var todayEndString;
// var todayDate= (function(d){
//   var year= d.getUTCFullYear();
//   var day= d.getUTCDate();
//   var datString
//   if(day<10){
//     dayString= '0'+day;
//   }
//   else{
//     dayString = day;
//   }
//   var month = d.getUTCMonth()+1;
//   var monthString;
//   if(month<10){
//     monthString='0'+month;
//   }
//   else{
//     monthString = month;
//   }
//   console.log(year+ " " + monthString + " "+ dayString);
//   todayStartString = year+'-'+monthString+'-'+dayString+'T00:00:00Z';
//   console.log(todayStartString);
//   todayEndString = year+'-'+monthString+'-'+dayString+'T23:59:59Z';
//   console.log(todayEndString);
// })

// function listEvents(auth) {
//   todayDate(d);

//   var calendar = google.calendar('v3');
//   calendar.events.list({
//     auth: auth,
//     calendarId: 'primary',
//     timeMin: todayStartString,
//     timeMax: todayEndString,
//     // timeMin='2017-06-07T00:00:00Z', 
//     // timeMax='2017-06-08T00:00:00Z',
//     maxResults: 10,
//     maxResults: 10,
//     singleEvents: true,
//     orderBy: 'startTime'
//   }, function(err, response) {
//     if (err) {
//       console.log('The API returned an error: ' + err);
//       return;
//     }
//     var events = response.items;
//     if (events.length == 0) {
//       console.log('No upcoming events found.');
//       calendarEventSentence='Your calendar is free today as you have no scheduled events.'
//     } else {

//       console.log('Upcoming ' + events.length+ ' events:');
//       if(events.length>5){
//         calendarEventSentence="You may need your morning coffee because you have " + events.length + " events today including "
//       }
//       else{
//       calendarEventSentence="You have a pretty light day with " + events.length + " events today including "
//         }
//       for (var i = 0; i < events.length; i++) {
//         var event = events[i];
//         var start = event.start.dateTime || event.start.date;
//         calendarEventSentence= calendarEventSentence + event.summary + ', ';
//         console.log('%s - %s', start, event.summary);
        

//       }
//       console.log(calendarEventSentence);
//       return calendarEventSentence
//     }
//   });
// }

// module.exports.getCal = function(){
//   return new Promise(function(resolve, reject){
    
//       if(err){
//         reject(err); 
//       }
//       else{
//         console.log(result);
//         resolve(result);
//       }
    
//   })
// }



// /************************* End of Google Calendar ************************************/