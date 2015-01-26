
import dep from 'js/dep';

import _ from 'lib/lodash';
//import $ from 'lib/jquery';

console.log('HELLO WORLD' + dep());

var playarea = $('#playarea');
console.log(playarea.html())

var width = 8,
  height = 6;

_.times(height, function (y) {
  var hexRowHtml = '<div class="hex-row">';

  _.times(width, function (x) {
    var even = x % 2 === 0 ? ' even' : '';
    hexRowHtml += '<div class="hex' + even + '">';
    hexRowHtml += '<div class="left"></div><div class="middle"></div><div class="right"></div>';
    hexRowHtml += '</div>';
  });

  hexRowHtml += '</div>';

  $('#playarea').append(hexRowHtml);
  console.log(y)
});
