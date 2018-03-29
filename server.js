const port = 3030;
let http   = require('http'),
express    = require('express'),
bodyParser = require('body-parser'),
path       = require('path'),
sqlite3    = require('sqlite3'),  // .verbose(),
db 		   = new sqlite3.Database('egg-voter.db'),
app        = express(),
// global variables
activeContest = null,
users      = ['Mark'];  // logged-in users

app.use(express.static(path.join(__dirname + '/dist')));
app.use(bodyParser.json())  // parse application/json
function nocache(req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}

app.post('/api/login', (req, res) => {
	// req.body:  User obj
	console.log('login:', req.body)
	let username = req.body.name;
	if (users.includes(username)) {
		res.status(400).end(`${username} is already logged in.`);
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
	users = users.filter( name => name !== username );
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
app.post('/api/contest', (req, res) => {  // create a new contest
	// req.body:  Contest obj
	console.log(req.body)
	if(activeContest !== null) {
		res.status(400).end(`Contest "${activeContest.name}" is already active.`);
		return;
	}
	let contest = req.body;
	db.run(`INSERT INTO contests 
		(name, ballotSlots, ballotsCast, active) VALUES (?,?,?,?)`,
		[contest.name, contest.ballotSlots, 0, 1],
		function(err) {  // can't use an arrow function here, otherwise this.lastID doesn't work
			if(err) {
				console.log(err);
				res.status(500).end(JSON.stringify(err));
			} else {
				activeContest = contest;
				contestId     = this.lastID;
				activeContest.id = contestId;
				console.log('rowid:', this);
				res.json({ id: contestId});
			}
		}
	);
});
app.get('/api/contest', nocache, (req, res) => {  // get active contest, if any
	if(activeContest !== null) {
		res.json(activeContest);
	} else {
		res.json(null);
	}
});
app.put('/api/contest/:id', (req, res) => {  // CURRENTLY ONLY USED TO CLOSE THE CONTEST
	if (activeContest === null) {
		res.status(400).end(`There is no active contest to update.`);
		return;
	}
	let contestId = Number(req.params.id);
	if (activeContest.id !== contestId) {
		res.status(400).end(`Contest IDs don't match: ` +
			`active=${activeContest.id}, requested=${contestId}`);
		return;
	}
	// req.body:  Contest obj
	console.log(req.body)
	let contest = req.body;
	if (contest.active !== 0)  {
		console.log("UNEXPECTED DATA");
		res.sendStatus(400);
	}
	db.run('UPDATE contests SET active = 0 WHERE id = ?', contestId,
		function(err) {
			if(err) {
				console.log(err);
				res.sendStatus(500);
			} else {
				activeContest = null;
				res.status(200);
			}
		}
	);
});
app.delete('/api/contest/:id', (req, res) => {
	if (activeContest === null) {
		res.status(400).end('There is no active contest to delete.');
		return;
	}
	let contestId = Number(req.params.id);
	if (activeContest.id !== contestId) {
		res.status(400).end(`Contest IDs don't match: ` + 
			`active=${activeContest.id}, requested=${contestId}`);
		return;
	}
	db.run('DELETE FROM contests WHERE id = ?', contestId,
		function(err) {
			if(err) {
				console.log(err);
				res.sendStatus(500);
			} else {
				activeContest = null;
				res.status(200);
			}
		}
	);
});
app.post('/api/ballot', (req, res) => {  // cast a ballot
	console.log('ballot:', req.body);    // obj, keys are username, contestId, votes
	if(activeContest === null) {
		res.status(400).end('There is no active contest.');
		return;
	}
	let username  = req.body.username,
		contestId = req.body.contestId,
		votes     = req.body.votes;    // this is an array of egg numbers
	if (activeContest.id !== contestId) {
		res.status(400).end(`Contest IDs don't match: ` + 
			`active=${activeContest.id}, requested=${contestId}`);
		return;
	}
	let placeholders = votes.map( vote => '(?,?,?)' ).join(',');
	let values       = []
	votes.forEach( vote =>  values.push(contestId, username, vote) );
	let sql          = `INSERT INTO votes (contestId, voter, itemId) VALUES ${placeholders}`;
	console.log('sql:', sql, '\nvalues:', values);
	db.run(sql, values,
		function(err) {
			if(err) {
				console.log(err);
				res.status(500).end(JSON.stringify(err));
			} else {
				res.status(200);
			}
		}
	);
});
app.post('/api/votes', (req, res) => {
	let username  = req.body.username,
		contestId = req.body.contestId;
	db.all('SELECT * from votes WHERE voter = ? AND contestId = ?',
		[username, contestId], (err, rows) => {
			if(err) {
				console.log(err);
				res.status(500).end(JSON.stringify(err));
			} else {
				res.json(rows);
			}
	});
});
app.get('/api/contest_results/:id', nocache, (req, res) => {
	// TBD SELECT * from votes where contestId = ?, req.params.id
	let contestId = Number(req.params.id);
	db.all('SELECT itemId, count(itemId) AS votes from votes WHERE contestId = ? ' +
		   'GROUP BY itemId ORDER BY votes DESC',
		[contestId], (err, rows) => {
			if(err) {
				console.log(err);
				res.status(500).end(JSON.stringify(err));
			} else {
				console.log(rows)
				res.json({
					ballotsCast: 4,
					votes: rows,
					ballotCount: 4
				});						}
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
			id integer PRIMARY KEY,
			contestId integer,
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

db.get("SELECT * from contests where active = 1", function(err, row) {
	if(err) {
		console.log(err);
	} else {
		activeContest = row === undefined? null : row;
		console.log('activeContest:', activeContest);
	}
});

const server = app.listen(port, (error) => {
	if (error) {
		console.log(error);
		return process.exit(1);
	} else {
		console.log('HTTP server listening on port ' + server.address().port);
	}
});
