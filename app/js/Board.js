import _ from 'lib/lodash';

import BoardView from 'js/BoardView';
import { hexkeyToPos, posTohexkey as toKey } from 'js/hexUtils';

var that;

class Board {
  constructor(params) {
    that = this;

    that.userPlayerRel = params.playerRel;

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
    _.each(units, (unit) => {
      this.addUnit(unit);
    });
  }

  // add new units
  addUnit(unit, ignoreAddingToView) {
    if (!ignoreAddingToView) {
      if (unit.speed) {
        that.view.placeUnit(unit.x, unit.y, unit.classType);
      } else {
        that.view.placeBuilding(unit.x, unit.y, unit.classType);
      }
    }
    that.unitsById[unit.id] = unit;
    that.unitsBySpaceId[toKey(unit.x, unit.y)][unit.id] = unit;
  }

  mPieceToVikingUnit(piece) {
    var pos = hexkeyToPos(piece.locationId);
    return {
      id: piece.id,
      ownerId: piece.ownerId,
      x: pos.x,
      y: pos.y,
      classType: piece.class.toLowerCase(),
      orders: piece.attributes.orders,
      initiative: piece.attributes.initiative,
      currentProduction: piece.attributes.currentProduction,
      speed: piece.attributes.speed
    };
  }

  // convert existing turn to pendingTurn
  //   opposite of getSubmittableTurn()
  initExistingTurn(turn) {
    var actions = turn.actions;

    _.each(actions, (action) => {
      if (action.type === 'OrderUnit') {
        this.pendingTurn[action.params.unitId] = action.params.orders;
      }
    });
  }

  // called on newTurn
  //   needs to be called on review?
  updateUnits(units) {
    _.each(units, (unit) => {
      var localUnit = this.unitsById[unit.id];
      if (localUnit) {
        // update unit
        //var pos = hexkeyToPos(unit.locationId);
        //localUnit.x = pos.x;
        //localUnit.y = pos.y;
        localUnit.orders = unit.attributes.orders;
        localUnit.currentProduction = unit.attributes.currentProduction;
      } else {
        // make new unit
        var newUnit = that.mPieceToVikingUnit(unit);
        that.addUnit(newUnit, true);
      }
    });

    this.initOrders();
  }

  //////
  //this.pendingTurn = {} of OrderUnit actions, key=unitId

  initOrders() {
    this.pendingTurn = {};
  }

  addPendingOrder(unitId, order) {
    if (!this.pendingTurn[unitId]) {
      this.pendingTurn[unitId] = [];
    }

    this.pendingTurn[unitId].push(order);
  }

  // determine if the order is in pendingTurn or a CancelOrder is needed
  //   orderIndex is the index of the array returned by this.getOrders()
  removeOrder(unitId, orderIndex) {
    var currentOrders = this.getOrders(unitId),
        orderToRemove = currentOrders[orderIndex];

    // look in pendingTurn
    if (this.pendingTurn[unitId] && this.pendingTurn[unitId].length !== 0) {
      var foundKey;
      _.each(this.pendingTurn[unitId], (order, key) => {
        console.log(order)
        console.log(orderToRemove)
        if (_.isEqual(order, orderToRemove)) {
          foundKey = key;
        }
      });
      if (!_.isUndefined(foundKey)) {
        this.pendingTurn[unitId].splice(foundKey, 1);
        return;
      }
    }

    // look in original orders
    var foundKey;
    _.each(this.getUnit(unitId).orders, (order, key) => {
      if (_.isEqual(order, orderToRemove)) {
        foundKey = key;
      }
    });
    if (!_.isUndefined(foundKey)) {
      // add new CancelOrder order
      this.addPendingOrder(unitId, {
        type: 'CancelOrder',
        params: {orderIndex: foundKey}
      });
      return;
    }
  }

  getOrders(unitId) {
    var unit = this.unitsById[unitId];
    if (!unit) {
      throw 'invalid unitId';
    }

    if (!this.pendingTurn[unitId] || this.pendingTurn[unitId].length === 0) {
      return unit.orders;
    }

    var orders = {
      CancelOrder: [],
      Move: [],
      ProduceUnit: []
    };

    _.each(this.pendingTurn[unitId], (order) => {
      orders[order.type].push(order);
    });

    // TODO strikethrough cancels, and turn X to an O? re reactivate

    //  sort CancelOrders decending
    var sortedCancelOrders = _.sortBy(orders['CancelOrder'], (cancelOrder) => {
      return -cancelOrder.params.orderIndex;
    });

    var currentOrders = _.cloneDeep(unit.orders);
    _.each(sortedCancelOrders, (cancelOrder) => {
      currentOrders.splice(cancelOrder.params.orderIndex, 1);
    });

    // add Move orders
    _.each(orders['Move'], (moveOrder) => {
      currentOrders.push(moveOrder);
    });

    // add ProduceUnit orders
    _.each(orders['ProduceUnit'], (produceUnitOrder) => {
      currentOrders.push(produceUnitOrder);
    });

    return currentOrders;
  }

  // returns an array of Actions
  getSubmittableTurn() {
    var actions = [];
    _.each(this.pendingTurn, (orders, unitId) => {
      var action = {
        type: 'OrderUnit',
        params: {unitId, orders}
      };
      actions.push(action);
    });

    return actions;
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

  getPlayerUnits() {
    var playerUnits = _.filter(that.unitsById, (unit) => {
      return unit.ownerId === that.userPlayerRel;
    });
    return playerUnits;
  }
}


export default Board;
