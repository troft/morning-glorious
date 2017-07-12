# morning-glorious
### The smarter wakeup call application 

Morning glorious is a better, smarter wakeup call that allows you to feel ready for your day. This app implements many API’s including ones from Bandwidth, Google Calendar, CNN News,  and Openweather. To set the wakeup call, the user inputs what time they want to be woken up. At that time, the app continuously calls until the user answers. At that time, the app speaks a sentence that tells the user what is on their calendar, what the weather forecast is, and what the top news stories are. When the sentence is finished, the app will end the call. 

## Demos 
* Making calls 
* Audio Playback
* Integrating Google Calendar’s API 
* Integrating Openweather API 
* Integrating CNN News API 

## Prerequisites 
* Catapult Account 
* Google Calendar Developer Account 
* CNN News Account 
* Openweather Account 
* Node 8.0+ 
* Ngrok or another port forwarding app 

## Making the App

The first part of a wakeup call is setting up what time the app should call in the morning. To do this, the app uses a database with times. For this example, the app will call every 2 minutes. 

```
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
```

Each minute, the app uses Cron and scans the database to check if it needs to make any calls.

```
new CronJob('* * * * *', cronFunction, null, true);
console.log(db)
```

Before making the call, the app retrieves the necessary information from the Google Calendar API, the CNN News API, and the Openweather API. It then strings together all the information into one cohesive sentence. 

```
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
```

Once the app makes the sentence, it can begin to make calls. 

```
.then(function(){
  http.listen(app.get('port'), function(){
    //once done loadin then do this (callback)
    console.log('listening on *:' + app.get('port'));
  })
 }) 
.catch(function(error){
  console.log(error);
});
```

When the app is triggered to make a call, it uses the createCallWithCallback method. 

```
var createCallWithCallback = function(toNumber, fromNumber, callbackUrl){
    return client.Call.create({
        from: fromNumber,
        to: toNumber,
        callbackUrl: callbackUrl


    })
};
```

It then repeatedly calls until the call is answered by checking the checkIfAnswer function. 

```
var checkIfAnswer = function(eventType){
    return (eventType === "answer");
}
```

Finally, when the call is answered, it speaks the sentence then hangs up. 

```
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
```









