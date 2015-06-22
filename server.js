var express = require('express');
var app = express();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/letspollthat';
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser')


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index');
});

function postHandler(req, res) {
  var results = [];
  var data = {question: req.body.question};
  pg.connect(connectionString, function(err, client, done) {
    client.query("INSERT INTO polls(question) values($1)", [data.question]);
    var query = client.query("SELECT * FROM polls ORDER BY id ASC");
    query.on('row', function(row) {
      results.push(row);
    });
    query.on('end', function() {
      client.end();
      return res.json(results);
    });
    if(err) {
      console.log(err);
    }
  });
}

app.post('/letspollthat', postHandler);

app.listen(port, function() {
  console.log('App is running on http://localhost: ' +port);
});

