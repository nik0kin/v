module.exports = {
  customBoardSettingsValidator: require('./hooks/customBoardSettingsValidator'),
  boardGenerator: require('./hooks/boardGenerator'),

  gameStart: require('./hooks/gameStart'),

  actions: {
    'OrderUnit': require('./actions/OrderUnit'),
//    'OrderBuilding': require('./actions/OrderBuilding')
  },

  //progressTurn: undefined, // doesnt exist because this is playByMail
  progressRound: require('./hooks/progressRound'),
  //winCondition: require('./code/winCondition')
};
