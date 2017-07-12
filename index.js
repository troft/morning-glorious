var weather = require('./weather');
var cal = require('./calendar.js');
var news = require('./news.js');


/****************************** Bandwidth setup **************************************/
var Bandwidth = require("node-bandwidth");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var http = require("http").Server(app);
var myBWNumber= process.env.BANDWIDTH_PHONE_NUMBER;

//used for Bandwidth 
app.use(bodyParser.json());
//use a json body parser
app.set('port', (process.env.PORT || 3000));
//set port to an environment variable port or 3000

/********************************* Cron setup *****************************************/
//used for Cron 
var moment = require('moment');
var CronJob = require('cron').CronJob;

/********************************* Cron Info *****************************************/

let db = [];

//puts events in the db
for(let time=0; time<60; time++){
  const event={
    phoneNumber:'+##########',
    time
  }
  db.push(event);
}
// new CronJob('* * * * * *', function() {
//   console.log('You will see this message every second');
// }, null, true);
const cronFunction = () =>{
  const now = moment().minute();
  console.log(`checking for messages for minute: ${now}`);
  let createCalls = [];
  //search db for times that match now 
  for(let i=0; i<db.length; i++){
    if(db[i].time === now){
      const myMessagePromise= sendCall(db[i].phoneNumber);
      //settling
      createCalls.push(myMessagePromise);
    }
  }
  if(createCalls.length !==0){
    console.log(createCalls);
  }
  //console.log(moment().second());
  Promise.all(createCalls)
  .then(messages =>{
    console.log(messages);
  })
  .catch(err =>{
    console.log('ERRRRRORRRRRR')
    console.log(err);
  })
}

new CronJob('* * * * *', cronFunction, null, true);
console.log(db)

/************************************* End Cron *************************************/

/***************************** Bandwidth Info Start *********************************/


//creates a new Bandwidth client 
var client = new Bandwidth({
    // uses my environment variables 
    userId    : "process.env.BANDWIDTH_USER_ID", // <-- note, this is not the same as the username you used to login to the portal
    apiToken  : "process.env.BANDWIDTH_API_TOKEN",
    apiSecret : "process.env.BANDWIDTH_API_SECRET"
});

//Listener (sets root to listen after)
app.get("/", function (req, res) {
    console.log(req); 
    res.send("Hi this is Sarah");
    //res.send(can be a website);
});




app.post("/outbound-callbacks", function(req, res){
    var body = req.body; 
    var sentence = "goodmorning Jillian! Today's weather is  " + desc + " and the current tempreture is " + temp + " degrees. "+ eventSentence + 'Here are the top 10 articles from CNN currently :  '+ newsSentence +' Have a great day!';
    console.log(body); 
    if(checkIfAnswer(body.eventType)){
        speakSentenceInCall(body.callId, sentence)
        .then(function(response){
            console.log(response);
        })
        .catch(function (error){
            console.log(error);
        });
    }
    else if(body.eventType === "hangup" && body.cause === "NO_ANSWER"){
      sendCall(body.to);
    }
    else if(isSpeakingDone(body)){
        client.Call.hangup(body.callId)
        .then(function(){
            console.log("Hangup call");
        })
        .catch(function(err){
            console.log("error in hanging up the call");
            console.log(err);
        });
    }

});
//entry point 
// app.post("/calls", function(req, res){
//     var callbackUrl= getBaseUrl(req) + "/outbound-callbacks";
//     var body = req.body;
//     var phoneNumber = body.phoneNumber;
//     createCallWithCallback(phoneNumber, myBWNumber, callbackUrl)
//     .then(function(call){
//         console.log(call);
//         res.send(call).status(201);
//     })
//     .catch(function(err){
//         console.log("ERR CREATING CALL")
//     });

// });

//set callback url 
var callbackUrl= "http://c10050a1.ngrok.io/outbound-callbacks";

//code to make a call 
const sendCall = (phoneNumber) =>{
  //need to return because its a promise 
  return client.Call.create({
  from: myBWNumber,
  to: phoneNumber,
  callbackUrl
})
} 

//callback helper methods
var checkIfAnswer = function(eventType){
    return (eventType === "answer");
}

var createCallWithCallback = function(toNumber, fromNumber, callbackUrl){
    return client.Call.create({
        from: fromNumber,
        to: toNumber,
        callbackUrl: callbackUrl


    })
};
var getBaseUrl = function (req) {
    return 'http://' + req.hostname;
};
var speakSentenceInCall = function(callID, sentence){
    return client.Call.speakSentence(callID, sentence);

}
var isSpeakingDone = function(callBackEvent){
    return (callBackEvent.eventType === "speak" && callBackEvent.state === "PLAYBACK_STOP");
}


var desc;
var temp;
var eventSentence;
var newsSentence;
weather.getWeather()
.then(function (weatherInfo){
  desc = weatherInfo;
  console.log(desc);
})
.then(weather.getTemp)
.then(function (weatherTemp){
  temp = weatherTemp;
  console.log(temp);
})
.then(cal.getCal)
.then(function(calendarSentence){
  eventSentence= calendarSentence;
  console.log(eventSentence);
})
.then(news.getNews)
.then(function (newsy){
  newsSentence= newsy;
  console.log(newsSentence);
})
.then(function(){
  http.listen(app.get('port'), function(){
    //once done loadin then do this (callback)
    console.log('listening on *:' + app.get('port'));
  })
 }) 
.catch(function(error){
  console.log(error);
});


