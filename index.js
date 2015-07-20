var Steam = require('steam');
var SteamID = require('steamid');
var AppDirectory = require('appdirectory');
var fs = require('fs');

require('util').inherits(SteamUser, require('events').EventEmitter);

module.exports = SteamUser;

function SteamUser(client, options) {
	this.client = client ? client : new Steam.SteamClient();
	this.steamID = null;

	var appdir = new AppDirectory({
		"appName": "node-steamuser",
		"appAuthor": "doctormckay"
	});

	this.options = options || {};

	var defaultOptions = {
		"dataDirectory": appdir.userData(),
		"autoRelogin": true,
		"singleSentryfile": false,
		"promptSteamGuardCode": true,
		"debug": false
	};

	for(var i in defaultOptions) {
		if(!defaultOptions.hasOwnProperty(i)) {
			continue;
		}

		if(typeof this.options[i] === 'undefined') {
			this.options[i] = defaultOptions[i];
		}
	}

	checkDirExists(this.options.dataDirectory);

	this.client.on('message', this._handleMessage.bind(this));

	var self = this;
	this.client.on('error', function(e) {
		if(self.options.autoRelogin) {
			self.emit('disconnected');
			self.logOn(true);
		} else {
			self.emit('error', e);
		}
	});
}

SteamUser.prototype.setOption = function(option, value) {
	this.options[option] = value;

	// Handle anything that needs to happen when particular options update
	switch(option) {
		case 'dataDirectory':
			checkDirExists(value);
			break;
	}
};

SteamUser.prototype.setOptions = function(options) {
	for(var i in options) {
		if(!options.hasOwnProperty(i)) {
			continue;
		}

		this.setOption(i, options[i]);
	}
};

function checkDirExists(dir) {
	var path = '';
	dir.replace(/\\/g, '/').split('/').forEach(function(dir, index) {
		if(index === 0 && !dir) {
			path = '/';
		} else {
			path += (path ? '/' : '') + dir;
		}

		if(!fs.existsSync(path)) {
			fs.mkdirSync(path, 0750);
		}
	});
}

require('./components/messages.js');
require('./components/logon.js');
require('./components/sentry.js');
require('./components/web.js');
require('./components/notifications.js');
require('./components/apps.js');
require('./components/account.js');