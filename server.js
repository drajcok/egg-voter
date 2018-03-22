const port = 3000,
http       = require('http'),
express    = require('express'),
path       = require('path'),

app = express(); 

app.use(express.static(path.join(__dirname + '/dist')));

app.get('/api', (req, res, next) => {
   res.json({
      test: true
   });
});

app.post('/api', (req, res, next) => {

});

app.get('*', (req, res, next) => {
   res.sendFile(path.join(__dirname, '/dist/index.html'));
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
