'use strict';

var listen = require('connected')
  , path = require('path')
  , fs = require('fs');

/**
 * Get an accurate type check for the given Object.
 *
 * @param {Mixed} obj The object that needs to be detected.
 * @returns {String} The object type.
 * @api public
 */
function is(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

/**
 * Create a HTTP server.
 *
 * @param {Mixed} server Different ways of constructing a server.
 * @param {Object} fn Callback or callbacks.
 * @returns {Server} The created server.
 */
function create(server, fn) {
  fn = create.fn(fn);

  var options;

  switch (is(server)) {
    case 'object':
      options = server;
    break;

    case 'number':
      options = { port: server };
    break;
  }

  var port = options.port || 443                // Force HTTPS by default.
    , certs = options.key && options.cert       // Check HTTPS certs.
    , secure = certs || 443 === port            // Check for true HTTPS
    , spdy = 'spdy' in options                  // Or are we spdy
    , type;

  //
  // Determine which type of server we need to create.
  //
  if (spdy) type = 'spdy';
  else if (secure) type = 'https';
  else type = 'http';

  //
  // We need to have SSL certs for SPDY and secure servers.
  //
  if ((secure || spdy) && !certs) {
    throw new Error('Missing the SSL key or certificate files in the options.');
  }

  //
  // When given a `options.root` assume that our SSL certs and keys are path
  // references that still needs to be read. This allows a much more human
  // readable interface for SSL.
  //
  if (secure && options.root) {
    ['cert', 'key', 'ca', 'pfx', 'crl'].filter(function filter(key) {
      return key in options;
    }).forEach(function parse(key) {
      var data = options[key];

      if (Array.isArray(data)) {
        options[key] = data.map(function read(file) {
          return fs.readFileSync(path.join(options.root, file));
        });
      } else {
        options[key] = fs.readFileSync(path.join(options.root, data));
      }
    });
  }

  switch (type) {
    case 'http':
      server = require('http').createServer();
    break;

    case 'https':
      server = require('https').createServer(options);
    break;

    case 'spdy':
      server = require('spdy').createServer(options);
    break;
  }

  //
  // Assign the last callbacks.
  //
  if (fn.request) server.on('request', fn.request);
  if (fn.close) server.once('close', fn.close);

  //
  // Things are completed, call callback.
  //
  if (fn[type]) fn[type]();

  if (options.listen === false || !fn.listening) return server;
  return listen(server, port, fn.listening);
}

/**
 * Create callbacks.
 *
 * @param {Object} fn Callback hooks.
 * @returns {Object} The callbacks
 * @api private
 */
create.fns = function fns(fn) {
  var callbacks = {};

  if ('function' === typeof fn) {
    callbacks.listening = fn;
    return callbacks;
  }

  [
    'close', 'request', 'listening',
    'http', 'https', 'spdy'
  ].forEach(function each(name) {
    if ('function' !== typeof fn[name]) return;

    callbacks[name] = fn[name];
  });

  return callbacks;
};

//
// Expose the create server method.
//
module.exports = create;
