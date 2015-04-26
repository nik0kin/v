// BoardView.js
//   - hexlib wrapper

import _ from 'lib/lodash';

import { hexlibToAxial, axialToHexlib, posTohexkey as toKey } from 'js/hexUtils';

var tileWidth = 58,
  tileHeight = 58

var toCssPos = function (pos) {
  return {
    left: pos.x,
    top: pos.y
  };
};

class BoardView {
  constructor(params) {
    this.tiles = {};
    this.units = {};
    this.buildings = {};
    this.size = params.size;
    this.element = params.playareaElement;
    this.$element = $('#' + this.element.id);
    this.createBoard(this.element, params.type,
        params.boardSpaces, params.size, params.clickSpaceCallback);
    this.initSelector();
  }

  getHexKey(x, y) {
    return hex.key(x,y);
  }

  getHexPosition(x, y) {
    var hexlibPos = axialToHexlib(x, y);
    return this.hexGrid.screenpos(hexlibPos.x, hexlibPos.y);
  }

  centerOn(x, y) {
    var pos = this.getHexPosition(x, y);
    this.hexGrid.reorient(
      -pos.x + this.$element.width()/2 - tileWidth/2,
      -pos.y + this.$element.height()/2 - tileHeight/2
    );
  }

  createBoard($playareaElement, type='horizontal', boardSpaces, size, clickSpaceCallback) {

    this.hexGrid = hex.grid($playareaElement, {
      type: "hexagonal_horizontal"
    });

    var that = this,
      grid = this.hexGrid,
      tiles = this.tiles,
      units = this.units;

    grid.tileWidth = tileWidth;
    grid.tileHeight = tileHeight;

    _.each(boardSpaces, function (bs) {
      var key = that.getHexKey(bs.x, bs.y),
          _class = `tile ${bs.terrainType}`,
          $tile = $(`<div class="${_class}">${key}</div>`),
          pos = that.getHexPosition(bs.x, bs.y);

      $tile.css(toCssPos(pos));
      $tile.appendTo(grid.root);
      tiles[key] = $tile;
      units[key] = [];
    });

    grid.addEvent("tileclick", function(e, x, y) {
      var axialPos = hexlibToAxial(x, y);
      if (axialPos.x < 0 || axialPos.x >= size.width
          || axialPos.y < 0 || axialPos.y >= size.height) {
        return;
      }
      clickSpaceCallback(axialPos);
    });

    grid.addEvent("tileover", function(e, x, y) {
      var axialPos = hexlibToAxial(x, y);
      that.onTileOver(axialPos);
    });

    grid.addEvent("tileout", function(e, x, y) {
      var axialPos = hexlibToAxial(x, y);
      that.onTileOut(axialPos);
    });
  }

  // pixel position
  getBuildingPosition(x, y) {
    var pos = this.getHexPosition(x, y);
    return {x: pos.x + 22, y: pos.y + 22};
  };
  getUnitPosition(x, y, spotsTaken) {
    var pos = this.getHexPosition(x, y),
      add;

    add = {
      0: {x: 4, y: 10},
      1: {x: 20, y: 23},
      2: {x: 42, y: 10}
    }[spotsTaken];

    return {x: pos.x + add.x, y: pos.y + add.y};
  };

  placeBuilding(x, y, classType) {
    var $newBuilding = $(`<div class="building ${classType}"></div>`),
      key = this.getHexKey(x,y),
      pos = this.getBuildingPosition(x, y);

    $newBuilding.css(toCssPos(pos));

    $newBuilding.appendTo(this.hexGrid.root);
    this.buildings[key] = $newBuilding;
  }

  placeUnit(x, y, classType) {
    var $newUnit = $(`<div class="unit ${classType}"></div>`),
      key = this.getHexKey(x,y),
      pos = this.getUnitPosition(x, y, this.units[key].length);

    $newUnit.css(toCssPos(pos));

    $newUnit.appendTo(this.hexGrid.root);
    this.units[key].push($newUnit);
  }

  moveUnit(fromX, fromY, toX, toY, classType) {
    // for now move any unit that is the same classType
    var unitsOnFromSpace = this.units[fromX+','+fromY],
        unitIndex,
        unitsOnToSpace = this.units[toX+','+toY],
        newPos = this.getUnitPosition(toX, toY, unitsOnToSpace.length);
    _.each(unitsOnFromSpace, function ($unit, index) {
      if ($unit.attr('class') === classType) {
        unitIndex = index;
      }
    });

    if (_.isUndefined(unitIndex)) {
      throw 'cant move unit from a space where the unit does not exist.';
    }

    var $unit;

    // shifting around sprites, so nothing looks funny when a unit moves
    if (unitsOnFromSpace.length > 1 && unitsOnFromSpace.length-1 !== unitIndex) {
      var $unitReplacingSpot = unitsOnFromSpace.pop();
      $unit = unitsOnFromSpace.splice(unitIndex, 1, $unitReplacingSpot)[0];
      $unitReplacingSpot.css({
        left: $unit.css('left'),
        top: $unit.css('top')
      });
    } else {
      $unit = unitsOnFromSpace.splice(unitIndex, 1)[0];
    }

    $unit.css(toCssPos(newPos));
    unitsOnToSpace.push($unit);
  }

  initSelector() {
    this.$selector = $('<div class="selector"></div>')
      .hide();
    this.hexGrid.root.appendChild(this.$selector[0]);

    this.$indicator = $('<div class="greenIndicator"></div>')
      .hide();
    this.hexGrid.root.appendChild(this.$indicator[0]);

    this.$indicatorNext = $('<div class="greenNextIndicator"></div>')
      .hide();
    this.hexGrid.root.appendChild(this.$indicatorNext[0]);
  }

  setSelectedSpace(x, y) {
    if (_.isUndefined(x) || _.isUndefined(y)) {
      // unselect
      this.$selector.hide();
      return;
    }

    // select
    this.$selector.show();
    var pos = this.getHexPosition(x, y);
    this.$selector.css(toCssPos(pos));
  }

  setIndicateNextSpace(x, y) {
    if (_.isUndefined(x) || _.isUndefined(y)) {
      // unselect
      this.$indicatorNext.hide();
      return;
    }

    // select
    this.$indicatorNext.show();
    var pos = this.getHexPosition(x, y);
    this.$indicatorNext.css(toCssPos(pos));
  }

  setMovementIndicator(callback) {
    if (!callback) {
      this.movementIndicatorCallback = undefined;
      this.$indicator.hide();
      return;
    }

    this.movementIndicatorCallback = callback;
  }

  onTileOver(axialPos) {
    if (!this.tiles[toKey(axialPos)]) return;
    if (!this.movementIndicatorCallback) return;

    // add a green or red indicator based on this.movementIndicatorCallback(x,y)
    var isInRange = this.movementIndicatorCallback(axialPos),
      pos = this.getHexPosition(axialPos.x, axialPos.y);
    this.$indicator.show()
      .css({left: pos.x, top: pos.y})
      .attr('class', isInRange ? 'greenIndicator' : 'redIndicator');

    //console.log(`is ${x},${y} in range: ${isInRange}`);
  }

  onTileOut(x, y) {
    if (!this.movementIndicatorCallback) return;

    // hide previous indicator
    this.$indicator.hide();
  }
}

export default BoardView;
