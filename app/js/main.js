
import dep from 'js/dep';

import _ from 'lib/lodash';
//import $ from 'lib/jquery';

console.log('HELLO WORLD' + dep());

var playareaElement = $('#playarea')[0];
console.log(playarea)

var width = 8,
  height = 6;

var grid = hex.grid(playareaElement, { type: "hexagonal_horizontal" }),
  tiles = {};

grid.tileWidth = 58;
grid.tileHeight = 58;
console.log(grid)

_.times(height, function (y) {
  _.times(width, function (x) {
    var $tile = $(`<div class="tile">${hex.key(x,y)}</div>`),
      inv = grid.screenpos(-x, y);

    $tile.css({
      left: inv.x,
      top: inv.y
    });
    $tile.appendTo(grid.root);
    tiles[hex.key(x, y)] = $tile;
  });
});

grid.reorient(150, 0);

grid.addEvent("tileclick", function(e, x, y) {
  if (-x < 0 || -x >= width || y < 0 || y >= height) {
    return;
  }
  console.log([-x, y], e.type);
});
