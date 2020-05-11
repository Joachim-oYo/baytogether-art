var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');

var results = [];

var count = 0;

fs.readdir(path.join(__dirname, '/svg'), function (err, files) {
  files
    .filter(function (file) { return file.substr(-4) === '.svg'; })
    .forEach(function (file) {
      fs.readFile(path.join(__dirname, '/svg') + '/' + file, 'utf-8', function (err, data) {
        if (err) { return console.error(err); }
        var $ = cheerio.load(data, { xmlMode: true });
        var data = getDatum($);
        
        results.push({
          id: 'shape'+count.toString(),
          data: data
        })

        console.log(files.length); 

        count++;
        if (files.length === count) { generateJson(); }
      });
    });
});

function getDatum($) {
  return [$('svg').attr('viewBox'), $('path').attr('d')];
}

function generateJson() {
  fs.writeFile('./svgPaths.json', JSON.stringify(results), 'utf8', function () {
    console.log('completed!');
    process.exit();
  });
}