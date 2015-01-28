// main.js
//  load assets & hookup muleSDK.Spinal

import Vikings from 'js/Vikings'; 

import sdk from 'lib/mule-sdk-js/mule-sdk';

var vikingsParams = {
  playareaElement: $('#playarea')[0]
};

var myVikings = new Vikings(vikingsParams);


var SDK = sdk('http://localhost:3130/webservices/');

var Spinal = SDK.Spinal();

var config = {
  gameId: '54b489c49cb8bfd8507d4837',
  userId: '54976c2ecae1efca06ade299'
};

Spinal.initQ(config)
  .then(function (result) {
    console.log(result);
  });