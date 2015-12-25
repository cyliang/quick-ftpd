var ftpd = require('ftpd');
var dns = require('dns');

var options = (function parseArg(argv) {
	if (argv.length < 6) {
		console.error('Usage: npm start <host> <port> <user> <password> [document_root]');
		process.exit(1);
	}

	return {
		host: argv[2],
		port: argv[3],
		user: argv[4],
		password: argv[5],
		root: process.cwd() + '/' + (argv[6] || 'doc_root')
	};
}(process.argv));

dns.lookup(options.host, function(err, address, fam) {
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
