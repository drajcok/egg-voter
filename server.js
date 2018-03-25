const port = 3030,
http       = require('http'),
express    = require('express'),
bodyParser = require('body-parser'),
path       = require('path'),
sqlite3    = require('sqlite3').verbose();
db 		   = new sqlite3.Database('egg-voter.db');

app = express(); 
app.use(express.static(path.join(__dirname + '/dist')));
// parse application/json
app.use(bodyParser.json())

app.post('/api/initdb', (req, res) => {
	console.log("creating DB tables")
	db.serialize( () => {
		//db.run(`CREATE TABLE IF NOT EXISTS contests (
		db.run(`CREATE TABLE contests (
			id integer PRIMARY KEY,
			name text UNIQUE,
			ballotSlots integer,
			ballotsCount integer,
			ballotsCastCount integer,
			active integer)`);
		db.run(`CREATE TABLE votes (
			contestId integer PRIMARY KEY,
			voter text,
			itemId integer)`);
		});
	res.sendStatus(200);
});
app.post('/api/contest/new', (req, res) => {
	console.log(req.body)
	contest = req.body;
	db.run(`INSERT INTO contests 
		(name, ballotSlots, ballotsCount, active) VALUES (?,?,?,?)`,
		[contest.name, contest.ballotSlots, contest.ballotsCount, 1],
		function(err) {
			if(err) {
				console.log(err);
				res.sendStatus(500);
			} else {
				console.log('rowid:', this);
				res.json({ id: this.lastID});
			}
		});
});
app.post('/api/contest/vote', (req, res) => {
	console.log(req.body)
	votes = req.body;
	return;
	// TODO first check to ensure the contestId is active??
	db.run(`INSERT INTO votes 
		(contestId, voter, itemId) VALUES (?,?,?)`,
		[],
		function(err) {
			if(err) {
				console.log(err);
				res.sendStatus(500);
			} else {
				res.sendStatus(200);
			}
		});
});
app.get('/api/contest/info', (req, res) => {
	db.get("SELECT * from contests where active = 1", function(err, row) {
		if(err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			console.log(row)
			res.json(row);
		}
	});
	// res.json({
	// 	name: "Adults",
	// 	votesAllowed: 5
	// });
 });
app.get('/api/contest/votes', (req, res) => {
	res.json({
		votesCast: 2,
		votes: [ [1,2] , [18, 3] ]
	});
 });

app.get('*', (req, res, next) => {
	res.sendFile(path.join(__dirname, '/dist/index.html'));
	//res.sendFile(path.join(__dirname, '/src/index.html'));
});
app.use((err, req, res, next) => {
	console.log('Got to end on server for reason: ', err);
});

const server = app.listen(port, (error) => {
	if (error) {
		console.log(error);
		return process.exit(1);
	} else {
		console.log('HTTP server listening on port ' + server.address().port);
	}
});
