import _ from 'lib/lodash';

import { hexkeyToPos, posTohexkey as toKey, axialHexManhattanDistance } from 'js/hexUtils';
import Board from 'js/Board';
import UIView from 'js/UIView';

import sdk from 'lib/mule-sdk-js/mule-sdk';
var Q = sdk('../../').Q;


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
      produceUnitClickedCallback: this.produceUnitClickedCallback,
      unitListClickedCallback: this.unitListClickedCallback,
      selectUnitClickedCallback: this.selectUnitClickedCallback,
      cancelUnitOrderClickedCallback: this.cancelUnitOrderClickedCallback
    });

    params.clickSpaceCallback = this.clickSpaceCallback;
    this.board = new Board(params);

    that.ui.initPlayerLabels(params.game.players);

    this.turns = {};

    this.initUnits(params.gameState.pieces, params.currentTurn);
    this.initModes();

    if (params.lastTurn) {
      this.turns[params.lastTurn.turnNumber] = params.lastTurn;
      this.startReviewMode(params.lastTurn);
    }
  }

  initUnits(pieces, currentTurn) {
    var units = [];

    _.each(pieces, function (piece) {
      var pos = hexkeyToPos(piece.locationId);
      units.push(that.board.mPieceToVikingUnit(piece));
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

    that.turns[result.turn.turnNumber] = result.turn;
    that.startReviewMode(result.turn);
  }

  getTurnMeta(turnNumber) {
    var turn = this.turns[turnNumber];
    if (turn) {
      return turn.metaTurn.actions[0].metadata;
    } else {
      return undefined;
    }
  }

  // STATES //

  initModes() {
    this.inReview = false;
    this.toReview = []; // using as a queue
    this.ui.setClickReviewButtonCallback(this.clickReviewButton);
  }

  startReviewMode(turn) {
    console.log('Review: ', turn.turnNumber);

    // If Reviewing already, dont interrupt and add to stack
    if (this.inReview) {
      this.toReview.push(turn.turnNumber);
      return;
    }

    // If in Play Mode, show turn list
    that.ui.showReviewButton();
    this.ui.setReviewModeLabel();

    // set turn info
    var turnMetadata = turn.metaTurn.actions[0].metadata;
    this.ui.setTurnList(turn.turnNumber, turnMetadata, this.board.getUnit);

    this.inReview = turn.turnNumber;
  }

  clickReviewButton() {
    console.log('Turn Review ' + that.inReview);

    that.ui.hideReviewButton();

    that.review(() => {
      that.inReview = false;

      // show possible next turn review
      if (that.toReview.length > 0) {
        var nextTurnNumber = _.first(that.toReview);
        that.toReview = _.rest(that.toReview); // pop
        that.startReviewMode(that.turns[nextTurnNumber]);
      } else {
        // otherwise startPlayMode
        setTimeout(() => {
          that.startPlayMode.call(that);
        }, 1000);
      }
    });
  }

  // play review
  review(callback) {
    var turnMetadata = that.getTurnMeta(that.inReview);

    if (_.isEmpty(turnMetadata.orders)) {
      return setTimeout(() => {
        callback.call(that);
      }, 1000);
    }

    // spend 2 seconds per turn "animating" it
    var reviewMove = function (moveOrderMeta, cb) {
      console.log(moveOrderMeta)
      var startPos = moveOrderMeta.startPos,
          lastPos = moveOrderMeta.path[moveOrderMeta.path.length - 1],
          pos = lastPos.x + ',' + lastPos.y,
          unitId = moveOrderMeta.unitId;

      // center on unit
      that.board.view.centerOn(startPos.x, startPos.y);

      setTimeout(() => {
        // move unit
        that.board.moveUnit(unitId, pos);

        // center on unit
        that.board.view.centerOn(lastPos.x, lastPos.y);

        setTimeout(cb, 1000);
      }, 1000);
    };

    var reviewProduceUnit = function (produceOrderMeta, cb) {
      var unitId = produceOrderMeta.unitId,
          building = that.board.getUnit(unitId);

      // center on building producing
      that.board.view.centerOn(building.x, building.y);

      if (produceOrderMeta.finish) {
        // show unit
        that.board.view.placeUnit(building.x, building.y, produceOrderMeta.classType);
      }

      setTimeout(cb, 500);
    };

    var promise = Q();

    // foreach order
    _.each(turnMetadata.orders, (order, key) => {
      promise = promise.then(function () {
        return Q.promise((resolve) => {
          console.log('order ' + key);
          // select move order (css)
          that.ui.setTurnOrderCurrent(key);

          // call reviewOrder
          try {
            switch (order.orderType) {
              case 'Move':
                reviewMove(order, resolve);
                break;
              case 'ProduceUnit':
                reviewProduceUnit(order, resolve);
                break;
              default:
                throw 'undefined order.orderType or orderReview';
            }
          } catch (e) {
            console.log(e.stack)
          }
        });
      });
    });

    promise.done(function () {
      console.log('orders done');
      callback.call(that);
    });
  }

  startPlayMode() {
    this.ui.setPlayModeLabel();
  }

  /////////////

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

    that.board.addPendingOrder(unitId, {
      type: 'Move',
      params: hexkeyToPos(spaceId)
    });
    that.moving = undefined;
    that.board.view.setMovementIndicator();
    that.selectUnit(unitId);
    that.setUnitListInfo();
  }

  addProduceUnitOrder(buildingId, classType) {
    console.log(`adding ProduceUnit order: ${buildingId} building ${classType}`);

    that.board.addPendingOrder(buildingId, {
      type: 'ProduceUnit',
      params: {
        classType
      }
    });

    that.selectUnit(buildingId);
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

  produceUnitClickedCallback(buildingId, classType) {
    that.addProduceUnitOrder(buildingId, classType);
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
    console.log(`cancel unit${unitId}) order: ${orderIndex}`);
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
