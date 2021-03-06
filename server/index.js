var graph = require('fbgraph');
var models = require('./models/index');
var dotenv = require('dotenv').config();

graph.setAccessToken(process.env.FB_ACCESS_TOKEN);

// var firstPageUrl = "385961098197634/feed?limit=500&fields=from,link,created_time,updated_time,message,source";
var firstPageUrl = "385961098197634/feed?fields=from,link,created_time,updated_time,message,source";
var pagesCounter = 0;
var pagesLimit = 2;
var delayBetweenPages = 20*1000;

var getLikes = function(postData, prototypeUrl) {
  graph.get(postData.id + "/likes?summary=1", function(err, res) {
    var likes = 0;
    if (res.summary && res.summary.total_count) {
      likes = res.summary.total_count;
    }
    //Get prototype creator safely
    var creatorName = '';
    var creatorId = '';
    if (postData.from) {
      creatorName = postData.from.name || '';
      creatorId = postData.from.id || '';
    }
    models.User.upsert({
      fb_id: creatorId,
      name: creatorName
    })
    .then(function(upserted){
      // 1 - Get the profile picture ID
      graph.get(creatorId + "/picture?redirect=false", function(err, res) {
        if (err) {
          console.log("Error retrieving pic: ", err);
          return;
        }
        models.User.upsert({
          fb_id: creatorId,
          name: creatorName,
          profile_picture_url: res.data.url
        })
        .catch(function(error) {
          console.log("Error upserting user: ", error);
        });
      });
      
      // 2 - In parallel, insert the prototype data
      models.Prototype.upsert({
        fb_id: postData.id,
        creator_fb_id: creatorId,
        message: postData.message,
        created_time: postData.created_time,
        updated_time: postData.updated_time,
        likes: likes,
        url: prototypeUrl,
        picture: postData.picture
      })
      .catch(function(error) {
        console.log("Error upserting prototype: ", error);
      });

    })
    .catch(function(error) {
      console.log("Error upserting user: ", error);
    })
  });
}

var getPage = function(url) {

  pagesCounter++;
  console.log("getting page " + pagesCounter);
  
  models.LastPageFetched.upsert({
    id: 1,
    url: url
  }); 

  graph.get(url, function(err, res) {
    if (err) {
      console.log("Error getting page: ", url, err);
      return;
    }
    if (res && res.data) {
      for (var i = 0; i < res.data.length; i++) {
        var postData = res.data[i];
        var message = postData.message;
        var link = postData.link;
        var prototypeUrl = undefined;
        if (link && link.indexOf("share.framerjs.com/") > 0) {
          prototypeUrl = link;
        }
        else if (message && message.indexOf("share.framerjs.com/") > 0) {
          // TODO: Think about other links that could appear in the message
          prototypeUrl = "http://" + message.substr(message.indexOf('share.framerjs.com/'), 31);
        }
        if (prototypeUrl) {
          getLikes(postData, prototypeUrl);
        }
      };
    }
    if(res.paging && res.paging.next && pagesCounter < pagesLimit) {
      setTimeout(function() {
        getPage(res.paging.next);
      }, delayBetweenPages);
    }
    else if (pagesCounter >= pagesLimit) {
      console.log("Pages limit reached. Stopping.")
    }
    else {
      console.log("No paging.next field found. Starting again");
      setTimeout(function() {
        getPage(firstPageUrl);
      }, delayBetweenPages);
    }
  });

}

models.LastPageFetched.findById(1).then(function(lastPageFetched) {
  if (lastPageFetched) {
    getPage(lastPageFetched.url);
  }
  else {
    getPage(firstPageUrl);
  }
});

// { data: 
//    [ { message: 'Hi. New to Framer and CoffeeScript. Very keen to learn, Are there any certified experts based in London for 1:1coaching?',
//        updated_time: '2016-02-03T20:57:06+0000',
//        id: '385961098197634_799173673543039' },
//     ....
//      { message: 'Koen will you be adding "Framer native" backdrop-filter?',
//        updated_time: '2016-02-01T15:15:58+0000',
//        id: '385961098197634_798396593620747' } ],
//   paging: 
//    { previous: 'https://graph.facebook.com/v2.5/385961098197634/feed?since=1454533026&access_token=CAAXpRMzWq5QBAJ8viD53ix7Bp5cjrLvrzw0GvLRXSfZBM0xJbHKKhRwc1rThKh5LFRSZCfPAorP2Yig6ZAyI1h2CPkGati0RUPZC4BTUgLJozl49BgnUw1ymWkc09lM2YySQ1RE9ZAZB3WNZBj9KUBlORTqcdwWBragyaqaESR8sZB6ZCUYsEKJYX&limit=25&__paging_token=enc_AdD7CTDxBTlNWoZC6c6SttibGPriGCAJKXd9ZB1JfItryUPT0Lp0bJJUDvfirZAoxsTusFMytw0sp8M6DueUx11isAELeZAmnytF3taXD8vL0fc7AQZDZD&__previous=1',
//      next: 'https://graph.facebook.com/v2.5/385961098197634/feed?access_token=CAAXpRMzWq5QBAJ8viD53ix7Bp5cjrLvrzw0GvLRXSfZBM0xJbHKKhRwc1rThKh5LFRSZCfPAorP2Yig6ZAyI1h2CPkGati0RUPZC4BTUgLJozl49BgnUw1ymWkc09lM2YySQ1RE9ZAZB3WNZBj9KUBlORTqcdwWBragyaqaESR8sZB6ZCUYsEKJYX&limit=25&until=1454339758&__paging_token=enc_AdB0J8RI2INl9y2YKy2GBY7tgY5RerXZCpxfDinuRlZBjTtKIHnZCLsnxrkpiXSokmy7ibuqURGsFAAP9UXlSrEJGiWKwWWeA9id7fv4VjffaALnQZDZD' } }

// graph.get("385961098197634_798304873629919/likes?summary=1", function(err, res) {
//   console.log(res);
// });

// { data: 
//    [ { id: '10105243113440456' },
//     .....
//      { id: '1076031885754296' },
//      { id: '10153930635033343' } ],
//   paging: 
//    { cursors: 
//       { after: 'MTAxNTM5MzA2MzUwMzMzNDM=',
//         before: 'MTAxMDUyNDMxMTM0NDA0NTY=' },
//      next: 'https://graph.facebook.com/v2.5/385961098197634_720419061418501/likes?summary=1&access_token=CAAXpRMzWq5QBAJ8viD53ix7Bp5cjrLvrzw0GvLRXSfZBM0xJbHKKhRwc1rThKh5LFRSZCfPAorP2Yig6ZAyI1h2CPkGati0RUPZC4BTUgLJozl49BgnUw1ymWkc09lM2YySQ1RE9ZAZB3WNZBj9KUBlORTqcdwWBragyaqaESR8sZB6ZCUYsEKJYX&limit=25&after=MTAxNTM5MzA2MzUwMzMzNDM%3D' },
//   summary: { total_count: 65, can_like: true, has_liked: false } }


// graph.get("385961098197634_720419061418501?fields=from, created_time, message, source", function(err, res) {
//   console.log(res);
// });

// { created_time: '2015-08-11T14:53:40+0000',
//   message: 'Heya guys! Check out this new example of text fields with floating labels - as seen in the Material Design spec. It contains some nifty tricks too! Here\'s an overview of what\'s included within the prototype:\n\n- A custom input class.\n- Input events (onkeyup, onkeydown).\n- Custom behaviours for Mobile and Desktop.\n- Animating the font-size with the "change:y" event.\n\nhttp://share.framerjs.com/4rer1y5f8ol8/\n\nHope this helps!\nFeel free to message me here if you have any questions. :-)',
//   id: '385961098197634_720419061418501' }

// graph.get("385961098197634_720419061418501/attachments", function(err, res) {
//   console.log(res);
// });

// { data: 
//    [ { media: [Object],
//        target: [Object],
//        type: 'video_inline',
//        url: 'https://www.facebook.com/benjamin.denboer.3/videos/839102102870930/' } ] }

