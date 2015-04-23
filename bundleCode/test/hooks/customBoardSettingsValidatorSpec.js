var _ = require('lodash'),
    should = require('should');

var customBoardSettingsValidator = require('../../').customBoardSettingsValidator;

describe('customBoardSettingsValidator Hook', function () {
  describe('should accept valid settings', function () {
    it('#1', function () {
      var cbs = {
        mapType: 'diamond',
        width: 30,
        height: 40
      };
      var invalidSettings = customBoardSettingsValidator(cbs);

      should(_.isEmpty(invalidSettings)).be.true;
    });
    it('#2', function () {
      var cbs = {
        mapType: 'hex',
        width: 35,
        height: 400
      };
      var invalidSettings = customBoardSettingsValidator(cbs);

      should(_.isEmpty(invalidSettings)).be.true;
    });
  });
  describe('should decline invalid settings', function () {
    it('#1', function () {
      var cbs = {
        mapType: 'diamond',
        width: 3000,
        height: 40
      };
      var invalidSettings = customBoardSettingsValidator(cbs);

      should(!!invalidSettings.width).be.true;
    });
    it('#2', function () {
      var cbs = {
        mapType: 'hex',
        width: 35,
        height: 4000
      };
      var invalidSettings = customBoardSettingsValidator(cbs);

      should(!!invalidSettings.height).be.true;
    });
    it('#3', function () {
      var cbs = {
        width: 35,
        height: 4000
      };
      var invalidSettings = customBoardSettingsValidator(cbs);

      should(!!invalidSettings.mapType).be.true;
    });
  });
});
