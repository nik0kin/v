var fs = require('fs'),
    parse = require('xml-parser'),
    _ = require('lodash');

var tileSetToTerrainTypeMap = {
  1: 'dirt',
  2: 'forest',
  3: 'grass',
  4: 'hills',
  6: 'magic',
  11: 'water'
}

exports.convertToVikingsMap = function (inputFile, outputFile) {
  var inputXML = fs.readFileSync(inputFile, 'utf8');
  var inspect = require('util').inspect;

  var inputJSON = parse(inputXML).root;
  //console.log(inspect(inputJSON, { colors: true, depth: Infinity }));

  var outputJSON = {};

  outputJSON.width = Number(inputJSON.attributes.width);
  outputJSON.height = Number(inputJSON.attributes.height);
  outputJSON.mapType = 'stagger-y rectangle';

  var tileSetJSON = inputJSON.children[0],
      layerJSON = inputJSON.children[1];


  var tilesArray = layerJSON.children[0].children,
      minBoard = [];

  var x = 0, y = 0;
  _.each(tilesArray, function (tile) {
    var space = {
      id: (x - Math.floor(y/2))+','+y,
      terrainType: tileSetToTerrainTypeMap[tile.attributes.gid]
    };

    minBoard.push(space);

    x++;
    if (x === outputJSON.width) {
      x = 0;
      y++;
    }
  });

  outputJSON.board = minBoard;

  //console.log(inspect(outputJSON, { colors: true, depth: Infinity }));

  fs.writeFileSync(outputFile, JSON.stringify(outputJSON), 'utf8');

  console.log(inputFile + ' converted to ' + outputFile);
};
