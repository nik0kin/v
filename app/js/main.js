// main.js
//  load assets & hookup muleSDK.Spinal

import Vikings from 'js/Vikings'; 

import sdk from 'lib/mule-sdk-js/mule-sdk';


var SDK = sdk('../../');
var Spinal = SDK.Spinal();

var myVikings;

var newTurnHook = function (result) {
  try {
    console.log('newTurnHook', result);
    myVikings.newTurnHook(result);
  } catch (error) {
    console.log(error, error.stack);
  }
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
      Spinal.startRefresh();
      updateRefreshLabel();
    })
    .catch(function (error) {
      console.log(error, error.stack);
    });
};

var initVikings = function (muleObjects) {
  var vikingsParams = {
    turnSubmitStyle: 'playByMail',
    playerRel: Spinal.getUserPlayerRel(),
    submitCallback: submitCallback,
    currentTurn: muleObjects.currentTurn,
    game: muleObjects.game,
    gameState: muleObjects.gameState,
    gameBoard: muleObjects.gameBoard,
    size: muleObjects.game.ruleBundleGameSettings.customBoardSettings,
    playareaElement: $('#playarea')[0]
  };

  myVikings = new Vikings(vikingsParams);

};

var updateRefreshLabel = function () {
  var secondsLeft = Math.floor(Spinal.getTimeTilNextRefresh() / 1000),
      refreshString;

  if (secondsLeft > 0) {
    var i, s = '';
    for (i=0;i<secondsLeft;i++) {s+='.'}
    refreshString = s;
  } else {
    refreshString = '~.~.~.~.~.~';
  }

  $('#refreshLabel').html(refreshString);

  var game = Spinal.getGame();
  var secondsTilTurn = (new Date(game.nextTurnTime).getTime() - Date.now()) / 1000;

  var seconds = Math.round(secondsTilTurn % 60),
      minutes = Math.floor(secondsTilTurn / 60),
      hours = Math.floor(secondsTilTurn / (60*60));

  var timeTilString = 'Turn ' + Spinal.getHistory().currentTurn + ' in ';
  timeTilString += hours + ':' + minutes + ':' + seconds;
  $('#timeTilTurn').html(timeTilString);

  setTimeout(updateRefreshLabel, 1000);
};

var submitCallback = function (actions) {
  Spinal.submitTurnQ(actions)
    .then(function (result) {
      console.log('Submitted turn');
      console.log(result);
      myVikings.submitSuccess();
    })
    .catch(function (err) {
      alert(JSON.stringify(err));
      myVikings.submitFailure();
    });
};


initMule();
