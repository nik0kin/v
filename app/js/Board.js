import _ from 'lib/lodash';

import BoardView from 'js/BoardView';
import { hexkeyToPos, posTohexkey as toKey } from 'js/hexUtils';

var that;

class Board {
  constructor(params) {
    that = this;

    that.spacesById = {};

    this.unitsById = {};
    this.unitsBySpaceId = {};

    var boardSpaces = [];
    _.each(params.gameBoard.board, function (space) {
      var pos = hexkeyToPos(space.id);
      var newSpace = {
        x: pos.x,
        y: pos.y,
        terrainType: space.attributes.terrainType
      };
      that.spacesById[space.id] = newSpace
      boardSpaces.push(newSpace);
      that.unitsBySpaceId[space.id] = {};
    });

    params.boardSpaces = boardSpaces;
    this.view = new BoardView(params);

    this.initOrders();
  }

  initUnits(units) {
    _.each(units, this.addUnit);
  }

  // add new units
  addUnit(unit) {
    that.view.placeUnit(unit.x, unit.y, unit.classType);
    that.unitsById[unit.id] = unit;
    that.unitsBySpaceId[toKey(unit.x, unit.y)][unit.id] = unit;
  }

  //////
  //this.pendingTurn = {} of OrderUnit actions, key=unitId

  initOrders() {
    this.pendingTurn = {};
  }

  addPendingOrder(unitId, order) {

  }

  removeOrder(unitId, orderIndex) {

  }

  getOrders(unitId) {
    var unit = this.unitsById[unitId];
    if (!unit) {
      throw 'invalid unitId';
    }
    return unit.orders;
  }

  //////

  moveUnit(unitId, spaceId) {
    var spacePos = hexkeyToPos(spaceId),
        unit = that.getUnit(unitId),
        prevPos = {x: unit.x, y: unit.y};

    // move unit around in unitsBySpaceId
    delete that.unitsBySpaceId[toKey(prevPos)][unit.id];
    that.unitsBySpaceId[toKey(spacePos)][unit.id] = unit;

    // change unit values
    unit.x = spacePos.x;
    unit.y = spacePos.y;

    // change on board
    that.view.moveUnit(prevPos.x, prevPos.y, spacePos.x, spacePos.y, unit.classType);
    that.view.setMovementIndicator();
  }

  getSpaceId(spaceId) {
    return that.spacesById[spaceId];
  }

  getUnit(unitId) {
    return that.unitsById[unitId];
  }

  getUnitsOnSpaceId(spaceId) {
    return that.unitsBySpaceId[spaceId];
  }
}


export default Board;
