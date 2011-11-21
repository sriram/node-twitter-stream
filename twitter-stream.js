var https = require('https');
var events = require('events');
var querystring = require('querystring');

exports.connect = function(options) {
  ensureRequiredOptions(options);

  options.queryString = prepareQueryString(options.params);

  var emitter = new events.EventEmitter;

  var request = https.request(prepareRequestOptions(options));

  request.on('response', function(response) {
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
      emitter.emit('status', JSON.parse(chunk));
    });
  });

  request.on('error', function(error) {
    emitter.emit('error', error);
  });

  request.end();

  return emitter;
};

var ensureRequiredOptions = function(options) {
  [ 'action', 'screen_name', 'password'].forEach(function(requiredOption) {
    if (options[requiredOption] === undefined) throw requiredOption + " is missing";
  });
};

var prepareQueryString = function(params) {
  var queryString = params ? '?' + querystring.stringify(params) : '';
	return queryString;
}

var prepareRequestOptions = function(options) {
  return {
    host: 'stream.twitter.com',
    path: '/1/statuses/' + options.action + '.json' + options.queryString,
    auth: options.screen_name + ':' + options.password,
  };
}

exports.helpers = {
  ensureRequiredOptions: ensureRequiredOptions,
  prepareQueryString: prepareQueryString,
}
