// main.js
//  load assets & hookup muleSDK.Spinal

import Vikings from 'js/Vikings'; 

import sdk from 'lib/mule-sdk-js/sdk'

var vikingsParams = {
  playareaElement: $('#playarea')[0]
};

var myVikings = new Vikings(vikingsParams);


var SDK = sdk('http://zion.tgp.io:313/webservices/');

SDK.Users.sessionQ()
  .then(function (result) {
    console.log(result);
  })
  .catch(function (error) {
    console.log(error);
  });
