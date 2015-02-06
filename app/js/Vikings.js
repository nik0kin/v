import _ from 'lib/lodash';

import { hexkeyToPos, posTohexkey as toKey, axialHexManhattanDistance } from 'js/hexUtils';
import Board from 'js/Board';
import UIView from 'js/UIView';

// TESTING
var width = 8,
  height = 6;

var that; //lol

class Vikings {
  constructor(params) {
    that = this;
    console.log('Vikings constructor', params);

    that.userPlayerRel = params.playerRel;
    that.submitCallback = params.submitCallback;

    that.ui = new UIView({
      userPlayerRel: this.userPlayerRel,
      submitButtonClickedCallback: this.submitButtonClickedCallback,
      moveUnitClickedCallback: this.moveUnitClickedCallback,
      unitListClickedCallback: this.unitListClickedCallback,
      selectUnitClickedCallback: this.selectUnitClickedCallback,
      cancelUnitOrderClickedCallback: this.cancelUnitOrderClickedCallback
    });

    params.clickSpaceCallback = this.clickSpaceCallback;
    this.board = new Board(params);

    that.ui.initPlayerLabels(params.game.players);

    this.initUnits(params.gameState.pieces, params.currentTurn);
  }

  initUnits(pieces, currentTurn) {
    var units = [];

    _.each(pieces, function (piece) {
      var pos = hexkeyToPos(piece.locationId);
      units.push({
        id: piece.id,
        ownerId: piece.ownerId,
        x: pos.x,
        y: pos.y,
        classType: piece.class.toLowerCase(),
        orders: piece.attributes.orders,
        initiative: piece.attributes.initiative,
        speed: piece.attributes.speed
      });
    });

    this.board.initUnits(units);

    if (currentTurn && currentTurn.playerTurns[this.userPlayerRel]) {
      that.board.initExistingTurn(currentTurn.playerTurns[this.userPlayerRel]);
      that.ui.setSubmitToResubmit();
    }

    this.setUnitListInfo();

    if (this.playerUnits[0]) {
      that.centerOn(this.playerUnits[0]);
    }
  }

  newTurnHook(result) {
    that.ui.setSubmitToNormal();

    that.board.updateUnits(result.gameState.pieces);
    that.selectUnit(that.selectedUnit);
    that.setUnitListInfo();
    that.ui.resetPlayerLabels();
  }

  setUnitListInfo() {
    this.playerUnits = _.cloneDeep(that.board.getPlayerUnits());
    _.each(this.playerUnits, (unit) => {
      unit.orders = that.board.getOrders(unit.id);
    });
    that.ui.setUnitListInfo(this.playerUnits);
  }

  selectSpace(pos) {
    that.selected = toKey(pos);
    that.board.view.setSelectedSpace(pos.x, pos.y);
    that.ui.setSelectedSpaceInfo(that.board.getSpaceId(that.selected),
        that.board.getUnitsOnSpaceId(that.selected));
    that.board.view.setIndicateNextSpace();
  }

  selectUnit(unitId) {
    if (!unitId) {
      that.selectedUnit = unitId;
      that.ui.setSelectedUnitInfo();
      return;
    }
    var unit = that.board.getUnit(unitId),
        unitOrders = that.board.getOrders(unitId);
    that.selectedUnit = unitId;
    that.ui.setSelectedUnitInfo(unit, unitOrders);
    that.selectSpace(unit);

    this.showUnitNextMove(unitOrders);
  }

  showUnitNextMove(orders) {
    var nextMoveOrder = _.find(orders, (order) => {
      return order.type === 'Move';
    });
    if (nextMoveOrder) {
      that.board.view.setIndicateNextSpace(nextMoveOrder.params.x, nextMoveOrder.params.y);
    } else {
      that.board.view.setIndicateNextSpace();
    }
  }

  centerOn(pos) {
    that.board.view.centerOn(pos.x, pos.y);
  }

  clickSpaceCallback(clickPos) {
    console.log('Clicked: ', clickPos);

    var hexKey = toKey(clickPos);

    if (that.moving) {
      that.tryToMoveUnit(that.moving, hexKey);
      return;
    } else if (that.selected === hexKey) {
      // current selection
      that.selected = undefined;
      that.board.view.setSelectedSpace();
      that.ui.setSelectedUnitInfo();
      that.ui.setSelectedSpaceInfo();
      that.board.view.setIndicateNextSpace();
      return;
    } else if (!that.selected) {
      // no selections
      that.selectSpace(clickPos);
      that.ui.setSelectedUnitInfo();
      that.selectedUnit = undefined;
      return;
    }

    // selection while having a selection
    that.selectSpace(clickPos);
    that.ui.setSelectedUnitInfo();
    that.selectedUnit = undefined;
  }

  tryToMoveUnit(unitId, spaceId) {
    var unit = that.board.getUnit(unitId),
        spacePos = hexkeyToPos(spaceId),
        allowed = that.checkMoveAllowed(unit, spacePos);

    if (spacePos.x === unit.x && spacePos.y === unit.y) {
      // moving to the same spot, ignore
      that.moving = undefined;
      that.board.view.setMovementIndicator();
      that.selectUnit(unitId); // cheap way to get reset button
      return;
    }

    if (allowed) {
      that.addMoveOrder(unitId, spaceId);
    } else {
      console.log('cant move there!');
    }
  }

  addMoveOrder(unitId, spaceId) {
    console.log(`adding Move order: ${unitId} to ${spaceId}`);
    //that.board.moveUnit(unitId, spaceId);
    that.board.addPendingOrder(unitId, {
      type: 'Move',
      params: hexkeyToPos(spaceId)
    });
    that.moving = undefined;
    that.board.view.setMovementIndicator();
    that.selectUnit(unitId);
    that.setUnitListInfo();
  }

  isWithinDistance(unit, ) {
    return function (spacePos) {
      var distance = axialHexManhattanDistance(unit.x, unit.y, spacePos.x, spacePos.y);
      return distance <= unit.speed;
    };
  }

  checkMoveAllowed(unit, spacePos) {
    if (that.board.getUnitsOnSpaceId(toKey(spacePos)).length >= 3) {
      return false;
    }

    return true;
  }

  // gets called when a move button on the side panel gets pressed
  moveUnitClickedCallback(unitId) {
    if (_.isUndefined(unitId)) {
      that.moving = undefined;
      that.board.view.setMovementIndicator();
      return;
    }
    console.log('starting moving ' + unitId);
    that.moving = unitId;
    var unit = that.board.getUnit(unitId);
    that.board.view.setMovementIndicator(that.isWithinDistance(unit));
  }

  selectUnitClickedCallback(unitId) {
    if (that.moving) {
      return;
    }
    that.selectUnit(unitId);
  }

  cancelUnitOrderClickedCallback(unitId, orderIndex) {
    if (that.moving) {
      return;
    }
    console.log(`cancel unit(${unitId}) order: ${orderIndex}`);
    that.board.removeOrder(unitId, orderIndex);
    that.selectUnit(unitId);
    that.setUnitListInfo();
  }

  unitListClickedCallback(unit) {
    if (that.moving) {
      return;
    }
    that.selectUnit(unit.id);
    that.centerOn(unit);
  }

  submitButtonClickedCallback() {
    that.ui.setSubmitToInProgress();
    var actions = that.board.getSubmittableTurn();
    that.submitCallback(actions);
  }

  submitSuccess() {
    that.ui.setSubmitToResubmit();
    that.ui.setPlayerLabelSubmitted(that.userPlayerRel);
  }

  submitFailure() {
    that.ui.setSubmitToNormal();
  }
}

export default Vikings;
