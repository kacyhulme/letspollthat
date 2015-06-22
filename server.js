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

//CREATE//////////////
function postHandler(req, res) {
  var results = [];
  var data = {question: req.body.question, option_one: req.body.option_one, option_two: req.body.option_two, option_three: req.body.option_three, option_four: req.body.option_four, votes: req.body.votes};
  pg.connect(connectionString, function(err, client, done) {
    client.query("INSERT INTO polls(question, option_one, option_two, option_three, option_four, votes) values($1, $2, $3, $4, $5, $6)", [data.question, data.option_one, data.option_two, data.option_three, data.option_four, data.votes]);
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

//READ//////////////
function readHandler(req, res) {
  var results = [];
  pg.connect(connectionString, function(err, client, done) {
    var query = client.query("SELECT * FROM polls ORDER BY id ASC;");
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
app.get('/letspollthat', readHandler);

//UPDATE//////////////
function updateHandler(req, res) {
  var results = [];
  var id = req.params.poll_id;
  var data = {question: req.body.question};
  pg.connect(connectionString, function(err,client,done) {
    client.query("UPDATE polls SET question=($1) WHERE id=($2)", [data.question, id]);
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
app.put('/letspollthat/:poll_id', updateHandler);


//DELETE//////////////
function deleteHandler(req, res) {
  var results = [];
  var id = req.params.poll_id;
  pg.connect(connectionString, function(err, client, done) {
    client.query("DELETE FROM polls WHERE id=($1)", [id]);
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
app.delete('/letspollthat/:poll_id', deleteHandler);
//////////////////////

app.listen(port, function() {
  console.log('App is running on http://localhost: ' +port);
});

