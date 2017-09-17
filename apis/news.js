
'use strict';

const AylienNewsApi = require('aylien-news-api'),
  querystring = require('querystring'),
  http = require('http'),
  https = require('https'),
  uuidV1 = require('uuid/v1'),
  fs = require('fs');

var apiInstance = new AylienNewsApi.DefaultApi();

// Configure API key authorization: app_id
var app_id = apiInstance.apiClient.authentications['app_id'];
app_id.apiKey = "270a22ef";

// Configure API key authorization: app_key
var app_key = apiInstance.apiClient.authentications['app_key'];
app_key.apiKey = "d020e5ad98503954f30886b9fc7fe9cb";

class CalculateScore {

  constructor(keyword) {
    this.keyword = keyword;
    this.score = 0.5;
  }

  getNews() {
    return new Promise(function(success, fail){
      var opts = {
        'title': this.keyword,
        'sortBy': 'published_at',
        'language': ['en'],
        'notLanguage': ['es', 'it'],
        'publishedAtStart': 'NOW-7DAYS',
        'publishedAtEnd': 'NOW', 
        'entitiesTitleType': ["Company", "Organization"]
      };
      
      var document = [];
      var callback = function(error, data, response) {
        if (error) {
          fail(error);
        }else {
          for (var i = 0; i < data.stories.length; i++){
            document.push(data.stories[i].title);
          }
        }
        success(document);
      };
      apiInstance.listStories(opts, callback);
    });
  };

  analyze(documents) {
    return new Promise(function(success, fail){
      var post_data = {
        'documents':
          documents
      };

      var post_options = {
        host: 'westus.api.cognitive.microsoft.com',
        port: '443',
        path: '/text/analytics/v2.0/sentiment',
        method: 'POST',
        headers: {
          'Authorization': 'Basic YmMzYjBiMTEtNTZjOS00MjBhLTk1MDItOGIyYTAwYjM2ZmZiOnpiRTF5akVFbXhtWA==',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Ocp-Apim-Subscription-Key': '0a6b6406e0444e3089f12db01c9c50ff'
        }
      };

      // Set up the request
      var analyzedHeadlines;
      var post_req = https.request(post_options, function(res) {
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
              analyzedHeadlines = JSON.parse(chunk);
          })
          res.on('end', ()=>{
            success(analyzedHeadlines);
          });
          res.on('error', error => {
            fail(e);
          });
      });
      // post the data
      post_req.write(JSON.stringify(post_data));
      post_req.end(); 
    });
  };

  calculateScore(scores) {
    let sum = 0
    let i = 0;
    scores.map(function(score) {
      i += 1;
      sum += score["score"];
    });
    this.score = sum / i; 
    return sum / i;
  }

  /* based on the news, calculate score of positiveness/negativeness */

  exe(){ 
    this.getNews()
    .then(function(newList){
        documents = newList.map((headline)=>{
          let uuidv1 = uuidV1();
          return {
            'language': 'en',
            'id': uuidv1,
            'text':headline
          };
      });
      analyze(documents).then(analyzedHeadline => calculateScore(analyzedHeadline["documents"])
      , err => { console.log(err) }
      );
    }, err => { console.log(err) });
  }
}

var key = new CalculateScore('Spotify');
key.exe()
console.log(key.score);