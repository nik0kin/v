var _ = require('lodash');

var mUtils = require('../utils/mUtils');

/*
Example ProduceUnit orderParams:
{
 classType: 'Worker'
}

each ProduceUnit:Class has a resource cost and build time
*/

var UnitCosts = {
  meadhall: {
    worker: {
      buildTime: 4,
      food: 1
    }
  }
};

var validateProduceUnit = function (M, building, orderParams, actionParams) {
  var buildingClass = building['class'];

  // is it a Building?
  if (building.attributes.speed) {
    throw 'unit ' + buildingClass + ' is not a Building';
  }

  // does the Building produce that classType
  if (!UnitCosts[buildingClass.toLowerCase()][orderParams.classType.toLowerCase()]) {
    throw buildingClass + ' cannot produce' + orderParams.classType;
  }

  // does the player have sufficient resources to produce the unit
  //   what if multiple orders are added that would use the same resources (two MeadHalls start creating 1 Worker each)
};

exports.validate = validateProduceUnit;

var executeProduceUnit = function (building, params, M) {
  var produceUnitMeta = {
    orderType: 'ProduceUnit',
    classType: params.classType
  };
  var currentTurnNumber = M.getCurrentTurnNumber(),
      unitCost = UnitCosts[building.getClass().toLowerCase()][params.classType.toLowerCase()];

  // if building .currentProduction === false, start production
  if (!building.getAttr('currentProduction')) {
    produceUnitMeta.start = true;

    var finishTurn = currentTurnNumber + unitCost.buildTime; // the turn production finishes
    building.setAttr('currentProduction', {finishTurn: finishTurn});
  }

  // if currentProduction.finishTurn === currentTurn, finish production
  if (building.getAttr('currentProduction').finishTurn === currentTurnNumber) {
    produceUnitMeta.finish = true;
    building.setAttr('currentProduction', false);
    produceUnitMeta.removeOrder = true;

    // add new unit to board
    var newUnit = mUtils.createUnit(params.classType, building.getOwner(), building.getLocationId());
    produceUnitMeta.newUnitId = newUnit.getId();
    newUnit.save(M);
  }

  return produceUnitMeta;
};

exports.execute = executeProduceUnit;
