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
app.get('/show/:poll_id', showHandler); //READ
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
    option_four: req.body.option_four
  };
  pg.connect(connectionString, function(err, client, done) {
    if(err) {
      console.log(err);
    }
    var query = client.query("INSERT INTO polls (question) values ($1) RETURNING poll_id", [data.question], function(err, result) {
      console.log(result);
      var new_poll_id = result.rows[0].poll_id;
      client.query("INSERT INTO poll_options(option_text, poll_id) values ($1, $2)", [data.option_one, new_poll_id]);
      client.query("INSERT INTO poll_options(option_text, poll_id) values ($1, $2)", [data.option_two, new_poll_id]);
      client.query("INSERT INTO poll_options(option_text, poll_id) values ($1, $2)", [data.option_three, new_poll_id]);
      client.query("INSERT INTO poll_options(option_text, poll_id) values ($1, $2)", [data.option_four, new_poll_id]);
      res.redirect('/show/' + new_poll_id);
    });
  });
}

//READ//
function showHandler(req, res) {
  var results = [];
  pg.connect(connectionString, function(err, client, done) {
    if(err) throw err;

    var query = client.query("SELECT polls.question, poll_options.* FROM polls JOIN poll_options ON polls.poll_id = poll_options.poll_id WHERE polls.poll_id=$1", [req.params.poll_id]);
    
    query.on('row', function(row) {
      results.push(row);
    });
    
    query.on('end', function(result) {
      client.end();
      res.render('show', {
        question: result.rows[0].question,
        option_one: result.rows[0].option_text,
        option_two: result.rows[0].option_text,
        option_three: result.rows[0].option_text,
        option_four: result.rows[0].option_text,
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
