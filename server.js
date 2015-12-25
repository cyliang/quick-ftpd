var ftpd = require('ftpd');
var dns = require('dns');
var os = require('os');

var options = (function parseArg(argv) {
	if (argv.length < 5) {
		console.error('Usage: node server.js <port> <user> <password> [document_root]');
		process.exit(1);
	}

	return {
		port: argv[2],
		user: argv[3],
		password: argv[4],
		root: argv[5] || 'doc_root'
	};
}(process.argv));

dns.lookup(os.hostname(), function(err, address, fam) {
	if (err) {
		console.error(err.message);
		process.exit(1);
	}

	server = new ftpd.FtpServer(address, {
		getInitialCwd: function() {
			return '/';
		},
		getRoot: function() {
			return options.root;
		}
	});

	server.on('error', function(error) {
		console.error(error);
	});

	server.on('client:connected', function(connection) {
		console.log('client connected: ' + connection.remoteAddress);

		connection.on('command:user', function(user, success, failure) {
			(user == options.user ? success : failure)();
		});

		connection.on('command:pass', function(pass, success, failure) {
			pass == options.password ? success(options.user) : failure();
		});
	});

	server.debugging = 4;
	server.listen(options.port);
});
