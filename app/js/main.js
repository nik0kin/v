// main.js
//  load assets & hookup muleSDK.Spinal

import Vikings from 'js/Vikings'; 

import sdk from 'lib/mule-sdk-js/mule-sdk';


var SDK = sdk('../../');
var Spinal = SDK.Spinal();

var myVikings;

var newTurnHook = function (result) {
  try {
    Spinal.setRefreshTime(15000);
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
    lastTurn: muleObjects.lastTurn,
    game: muleObjects.game,
    gameState: muleObjects.gameState,
    gameBoard: muleObjects.gameBoard,
    size: muleObjects.game.ruleBundleGameSettings.customBoardSettings,
    playareaElement: $('#playarea')[0]
  };

  myVikings = new Vikings(vikingsParams);

};

var getTimeString = function (secondsTilTurn) {
  var seconds = Math.round(secondsTilTurn % 60),
      minutes = Math.floor(secondsTilTurn / 60),
      hours = Math.floor(secondsTilTurn / (60*60));

  if (seconds < 0) seconds = 0;
  if (minutes < 0) minutes = 0;
  if (hours < 0) hours = 0;

  var sStr = seconds < 10 ? '0' + seconds : seconds,
      mStr = minutes < 10 ? '0' + minutes : minutes,
      hStr = hours < 10 ? '0' + hours : hours;

  return hStr + ':' + mStr + ':' + sStr;
};

var updateRefreshLabel = function () {
  var secondsLeft = Math.floor(Spinal.getTimeTilNextRefresh() / 1000),
      refreshString;

  if (secondsLeft > 0) {
    var i, s = '';
    for (i=0;i<secondsLeft;i++) {s+='.';}
    refreshString = s;
  } else {
    refreshString = '~........~';
  }

  $('#refreshLabel').html(refreshString);

  var game = Spinal.getGame();
  var secondsTilTurn = (new Date(game.nextTurnTime).getTime() - Date.now()) / 1000;

  var timeTilString = 'Turn ' + Spinal.getHistory().currentTurn + ' in ';
  var timeString = getTimeString(secondsTilTurn);
  if (timeString === '00:00:00') {
    Spinal.setRefreshTime(2000);
  }

  timeTilString += timeString;
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
