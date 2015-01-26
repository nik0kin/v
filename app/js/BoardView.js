import _ from 'lib/lodash';

var tileWidth = 58,
  tileHeight = 58


class BoardView {
  constructor(params) {
    this.tiles = {};
    this.units = {};
    this.size = params.size;
    this.createBoard(params.playareaElement, params.type, params.size, params.clickSpaceCallback);
    this.initSelector();

    //testing
    this.placeUnit(0, 0, 'viking');
    this.placeUnit(0, 0, 'shieldMaiden');
    this.placeUnit(0, 0, 'viking');
    this.placeUnit(2, 2, 'shieldMaiden');
    this.placeUnit(5, 4, 'viking');
  }

  getHexKey(x, y) {
    return hex.key(x,y);
  }

  getHexPosition(x, y) {
    return this.hexGrid.screenpos(-x, y);
  }

  createBoard($playareaElement, type='horizontal', size, clickSpaceCallback) {

    this.hexGrid = hex.grid($playareaElement, {
      type: "hexagonal_horizontal"
    });

    var that = this,
      grid = this.hexGrid,
      tiles = this.tiles,
      units = this.units;

    grid.tileWidth = tileWidth;
    grid.tileHeight = tileHeight;

    _.times(size.height, function (y) {
      _.times(size.width, function (x) {
        var key = that.getHexKey(x, y),
          $tile = $(`<div class="tile">${key}</div>`),
          pos = that.getHexPosition(x, y);

        $tile.css({
          left: pos.x,
          top: pos.y
        });
        $tile.appendTo(grid.root);
        tiles[key] = $tile;
        units[key] = [];
      });
    });

    grid.reorient(150, 0);

    grid.addEvent("tileclick", function(e, x, y) {
      if (-x < 0 || -x >= size.width || y < 0 || y >= size.height) {
        return;
      }
      x = -x === -0 ? 0 : -x; //javascript lol
      clickSpaceCallback(x, y);
    });
  }

  getUnitPosition(x, y, spotsTaken) {
    var pos = this.getHexPosition(x, y),
      add;

    add = {
      0: {x: 4, y: 0},
      1: {x: 22, y: 15},
      2: {x: 42, y: 0}
    }[spotsTaken];

    return {x: pos.x + add.x, y: pos.y + add.y};
  };

  placeUnit(x, y, classType) {
    var $newUnit = $(`<div class="${classType}"></div>`),
      key = this.getHexKey(x,y),
      pos = this.getUnitPosition(x, y, this.units[key].length);

    $newUnit.css({
      left: pos.x,
      top: pos.y
    });

    $newUnit.appendTo(this.hexGrid.root);
    this.units[key].push($newUnit);
  }

  initSelector() {
    this.$selector = $('<div class="selector"></div>')
      .hide();
    this.hexGrid.root.appendChild(this.$selector[0]);
    this.$selectedSpaceInfo = $('#selectedSpaceInfo');
  }

  setSelectedSpace(x, y) {
    if (_.isUndefined(x) || _.isUndefined(y)) {
      // unselect
      this.$selector.hide();
      this.$selectedSpaceInfo.html('');
      return;
    }

    // select
    this.$selector.show();
    var pos = this.getHexPosition(x, y);
    this.$selector.css({
      left: pos.x,
      top: pos.y 
    });

    var selectedSpaceHtml = `Selected Space: ${x}, ${y}`;

    this.$selectedSpaceInfo.html(selectedSpaceHtml);
  }
}

export default BoardView;
