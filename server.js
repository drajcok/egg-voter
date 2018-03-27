const port = 3030;
let http   = require('http'),
express    = require('express'),
bodyParser = require('body-parser'),
path       = require('path'),
sqlite3    = require('sqlite3').verbose(),
db 		   = new sqlite3.Database('egg-voter.db'),
app        = express(),
users      = ['Mark'];  // logged-in users

// TBD, get active contest, if there is one

app.use(express.static(path.join(__dirname + '/dist')));
// parse application/json
app.use(bodyParser.json())

app.post('/api/login', (req, res) => {
	// req.body:  User obj
	console.log('login:', req.body)
	let username = req.body.name;
	if (users.includes(username)) {
		res.status(500).end(`${username} is already logged in.`);
	} else {
		users.push(username);
		console.log('users:', users);
		res.sendStatus(200);
	}
});
app.post('/api/logout', (req, res) => {
	// req.body:  User obj
	console.log('logout:', req.body)
	let username = req.body.name;
	users = users.filter( name => name !== username);
	console.log('users:', users);
	res.sendStatus(200);
});
app.get('/api/user_list', (req, res) => {
	////res.sendFile(path.join(__dirname, '/dist/userlist.txt'));
	res.sendFile(path.join(__dirname, '/src/assets/userlist.txt'));
});
app.post('/api/loggedin_users', (req, res) => {
	// req.body:  null
	res.json(users);
});
app.post('/api/create_contest', (req, res) => {
	// req.body:  Contest obj
	console.log(req.body)
	contest = req.body;
	db.run(`INSERT INTO contests 
		(name, ballotSlots, ballotsCast, active) VALUES (?,?,?,?)`,
		[contest.name, contest.ballotSlots, 0, 1],
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
app.post('/api/contest_info', (req, res) => {
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
app.post('/api/cast_vote', (req, res) => {
	console.log(req.body)
	let votes = req.body;
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
 app.post('/api/ballots_cast', (req, res) => {
	// TBD verify that contest is currently the active one
	console.log(req.body)
	let contest = req.body
	res.json( {ballotsCast: 2} );
 });
app.post('/api/contest_results', (req, res) => {
	res.json({
		ballotsCast: 2,
		votes: [{id: 1, votes: 2} , {id: 18, votes: 3} ]
	});
 });
 app.post('/api/initdb', (req, res) => {
	console.log("creating DB tables")
	db.serialize( () => {
		//db.run(`CREATE TABLE IF NOT EXISTS contests (
		db.run(`CREATE TABLE contests (
			id integer PRIMARY KEY,
			name text UNIQUE,
			ballotSlots integer,
			ballotsCast integer,
			active integer)`);
		db.run(`CREATE TABLE votes (
			contestId integer PRIMARY KEY,
			voter text,
			itemId integer)`);
		});
	res.sendStatus(200);
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
