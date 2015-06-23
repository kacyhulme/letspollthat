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
  res.render('index')
});

app.post('/create', createHandler); //CREATE
app.get('/show/:id', showHandler); //READ
app.put('/update/:poll_id', updateHandler); //UPDATE
app.delete('/letspollthat/:poll_id', deleteHandler); //DELETE

app.listen(port, function() {
  console.log('App is running on http://localhost: ' +port);
});

//CREATE//
//create: $ curl --data "text=test&complete=false" http://127.0.0.1:3000/api/v1/todos
function createHandler(req, res) {
  var results = [];
  var data = {
    question: req.body.question, 
    option_one: req.body.option_one, 
    option_two: req.body.option_two, 
    option_three: req.body.option_three, 
    option_four: req.body.option_four, 
    votes: req.body.votes
  };
  pg.connect(connectionString, function(err, client, done) {
    if(err) {
      console.log(err);
    }
    client.query("INSERT INTO polls(question, option_one, option_two, option_three, option_four, votes) values ($1, $2, $3, $4, $5, $6)", [data.question, data.option_one, data.option_two, data.option_three, data.option_four, data.votes]);
    ///FIXME
    res.redirect('/show/6');
  });
}

//READ//
function showHandler(req, res) {
  var results = [];
  pg.connect(connectionString, function(err, client, done) {
    if(err) throw err;

    var query = client.query("SELECT * FROM polls WHERE id=$1", [req.params.id]);
    
    query.on('row', function(row) {
      results.push(row);
    });
    
    query.on('end', function() {
      client.end();
      res.render('show', {
        question: results[0].question,
        option_one: results[0].option_one,
        option_two: results[0].option_two,
        option_three: results[0].option_three,
        option_four: results[0].option_four,
      });
    });
  });
}

//UPDATE//
function updateHandler(req, res) {
  var results = [];
  var id = req.params.poll_id;
  var data = {question: req.body.question, option_one: req.body.option_one, option_two: req.body.option_two, option_three: req.body.option_three, option_four: req.body.option_four, votes: req.body.votes};
  pg.connect(connectionString, function(err,client,done) {
    if(err) throw err;
    client.query("UPDATE polls SET question=($1), option_one=($2), option_two=($3), option_three=($4), option_four=($5), votes=($6) WHERE id=($7)", [data.question, data.option_one, data.option_two, data.option_three, data.option_four, data.votes, id]);
    var query = client.query("SELECT * FROM polls ORDER BY id ASC");
    query.on('row', function(row) {
      results.push(row);
    });
    query.on('end', function() {
      client.end();
      return res.json(results);
    });
  });
}

//DELETE//
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
