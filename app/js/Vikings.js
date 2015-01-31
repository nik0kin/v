import _ from 'lib/lodash';

import { hexkeyToPos, posTohexkey as toKey } from 'js/hexUtils';
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

    that.ui = new UIView(this.moveUnitClickedCallback);

    params.clickSpaceCallback = this.clickSpaceCallback;
    this.board = new Board(params);

    // testing
    this.initUnits(params.gameState.pieces)
  }

  initUnits(pieces) {
    var units = [];

    _.each(pieces, function (piece) {
      var pos = hexkeyToPos(piece.locationId);
      units.push({
        id: piece.id,
        x: pos.x,
        y: pos.y,
        classType: piece.class.toLowerCase(),
        speed: piece.attributes.speed
      });
    });

    this.board.initUnits(units);
  }

  newTurnHook(result) {

  }

  selectSpace(pos) {
    that.selected = toKey(pos);
    that.board.view.setSelectedSpace(pos.x, pos.y);
    that.ui.setSelectedSpaceInfo(that.board.getSpaceId(that.selected),
        that.board.getUnitsOnSpaceId(that.selected));
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
      that.ui.setSelectedSpaceInfo();
      return;
    } else if (!that.selected) {
      // no selections
      that.selectSpace(clickPos);
      return;
    }

    // selection while having a selection
    that.selectSpace(clickPos);
  }

  tryToMoveUnit(unitId, spaceId) {
    var unit = that.board.getUnit(unitId),
        spacePos = hexkeyToPos(spaceId),
        allowed = that.checkMoveAllowed(unit)(spacePos);

    if (allowed) {
      console.log(`moving ${unitId} to ${spaceId}`);
      that.board.moveUnit(unitId, spaceId);
      that.moving = undefined;
      that.selectSpace(spacePos);
    } else {
      console.log('cant move there!');
    }
  }

  checkMoveAllowed(unit) {
    return function (spacePos) {
      if (that.board.getUnitsOnSpaceId(toKey(spacePos)).length >= 3) {
        return false;
      }

      var yDelta = unit.y - spacePos.y,
        xDelta = unit.x - spacePos.x;

      return Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2)) < unit.speed;
    };
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
    that.board.view.setMovementIndicator(that.checkMoveAllowed(unit));
  }
}

export default Vikings;
