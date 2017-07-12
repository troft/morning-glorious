console.log("Hello World");
var bodyParser = require("body-parser");
var cnnNews = require("cnn-news");



// cnnNews.top(function(error, meta, articles){
//   let myNews = [];
//   for(let article of articles) {
//     const newsThing = {
//       title: article.title,
//       description: article.description
//     }
//     myNews.push(newsThing);
//   }
//   console.log(articles);
// })
module.exports.getNews = function() {

    return new Promise(function(resolve, reject){

        cnnNews.top(function (error, meta, articles) {
            if(error){
                reject(error);
            }
            else {
                var newsSentence;
                var i = 0;
                for (let article of articles) {
                    if (i === 0) {
                        newsSentence = "first, " + article.title;
                    }
                    else if (i ===1) {
                        newsSentence = newsSentence + " the second article is   " + article.title;
                    }
                    else if (i ===2) {
                        newsSentence = newsSentence + " the third article is   " + article.title;
                    }
                    else if (i ===3) {
                        newsSentence = newsSentence + " the fourth article is   " + article.title;
                    }
                    else if (i ===4) {
                        newsSentence = newsSentence + " the fifth article is   " + article.title;
                    }
                    else {
                        break;
                    }
                    i++;
                }
                //console.log(newsSentence);
                resolve(newsSentence);
            }
        })
    })
}