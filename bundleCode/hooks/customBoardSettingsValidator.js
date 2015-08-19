var _ = require('lodash');

/*
var example = {
  mapType: diamond, hex, custom
  mapName: 'twinMountains'  // only if mapType = custom
  height: 2 - 500
  width: 2 - 500
}

*/

var customBoardSettingsValidator = function (customBoardSettings) {
  var invalidSettings = {};

  var cbs = customBoardSettings;

  if (_.isString(cbs.mapName)) {
    return invalidSettings;
  }

  if (cbs.mapType === 'diamond' || cbs.mapType === 'hex') {
    if (!_.isNumber(cbs.width) || cbs.width < 2 || cbs.width > 500) {
      invalidSettings.width = 'width must be 2-500';
    }
    if (!_.isNumber(cbs.height) || cbs.height < 2 || cbs.height > 500) {
      invalidSettings.height = 'height must be 2-500';
    }
  } else {
    invalidSettings.mapType = 'missing mapType';
  }
  return invalidSettings;
};

module.exports = customBoardSettingsValidator;
