var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/letspollthat';
var client = new pg.Client(connectionString);
client.connect();

//var query = client.query('CREATE TABLE polls(poll_id SERIAL PRIMARY KEY, question VARCHAR(40) not null)');
//query.on('end', function() { client.end(); });

//var query = client.query('CREATE TABLE poll_options(poll_option_id SERIAL PRIMARY KEY, poll_id integer REFERENCES polls (poll_id), option_text VARCHAR(100) not null, votes INTEGER)');
//query.on('end', function() { client.end(); });

