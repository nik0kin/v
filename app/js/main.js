// main.js
//  load assets & hookup muleSDK.Spinal

import Vikings from 'js/Vikings'; 

import sdk from 'lib/mule-sdk-js/mule-sdk';


var SDK = sdk('../../');
var Spinal = SDK.Spinal();

var myVikings;

var newTurnHook = function (result) {
  console.log('newTurnHook', result);
  myVikings.newTurnHook(result);
};

var initMule = function () {  
  var config = {
    refreshTime: 15000,
    turnSubmitStyle: 'playByMail',
    gameIdUrlKey: 'gameId',
    useSessionForUserId: true,
    newTurnHook: newTurnHook
  };

  Spinal.initQ(config)
    .then(function (result) {
      console.log(result);
      initVikings(result);
    })
    .catch(function (error) {
      console.log(error, error.stack);
    });
};

var initVikings = function (muleObjects) {
  var vikingsParams = {
    gameState: muleObjects.gameState,
    gameBoard: muleObjects.gameBoard,
    size: muleObjects.game.ruleBundleGameSettings.customBoardSettings,
    playareaElement: $('#playarea')[0]
  };

  myVikings = new Vikings(vikingsParams);

};


initMule();
