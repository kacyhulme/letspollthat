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
app.get('/thanks', function(req, res) {
  res.render('thanks')
});
app.post('/create', createHandler); //CREATE
app.get('/show/:poll_id', showHandler); //READ
app.post('/update', updateHandler); //UPDATE
app.delete('/letspollthat/:poll_id', deleteHandler); //DELETE

app.listen(port, function() {
  console.log('App is running on http://localhost: ' +port);
});

//CREATE//
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
      var new_poll_id = result.rows[0].poll_id;
      var prepStmt = "INSERT INTO poll_options(option_text, poll_id, votes) values ($1, $2, $3)";
      client.query(prepStmt, [data.option_one, new_poll_id, 0]);
      client.query(prepStmt, [data.option_two, new_poll_id, 0]);
      client.query(prepStmt, [data.option_three, new_poll_id, 0]);
      client.query(prepStmt, [data.option_four, new_poll_id, 0]);
      res.redirect('/show/' + new_poll_id);
    });
  });
}

//READ//
function showHandler(req, res) {
  var results = [];
  pg.connect(connectionString, function(err, client, done) {
    if(err) throw err;

    var query = client.query("SELECT polls.question, poll_options.option_text, poll_options.poll_option_id FROM polls JOIN poll_options ON polls.poll_id = poll_options.poll_id WHERE polls.poll_id=$1", [req.params.poll_id]);   
    query.on('row', function(row) {
      results.push(row);
    });
    
    query.on('end', function(_) {
      client.end();
      res.render('show', {
        question: results[0].question,
        option_one: results[0].option_text,
        option_one_val: results[0].poll_option_id,
        option_two: results[1].option_text,
        option_two_val: results[1].poll_option_id,
        option_three: results[2].option_text,
        option_three_val: results[2].poll_option_id,
        option_four: results[3].option_text,
        option_four_val: results[3].poll_option_id
      });
    });
  });
}

//UPDATE//
function updateHandler(req, res) {
  var results = [];

  pg.connect(connectionString, function(err, client, done) {
    if(err) throw err;
    client.query("UPDATE poll_options SET votes = votes + 1 WHERE poll_option_id=($1)", [req.body.selected]);
    res.redirect('/thanks');
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
