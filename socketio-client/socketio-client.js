module.exports = function (RED) {
  'use strict';
  let path = require('path');
  let sockets = {};

  function SocketIOConnector(n) {
    RED.nodes.createNode(this, n);
    this.server = RED.nodes.getNode(n.server);
    this.name = n.name;
    this.sockets = sockets;
    let node = this;

    sockets[node.name] = connect(n);

    sockets[node.name].on('connect', () => {
      node.send({ payload: { socketId: node.name, status: 'connected' } });
      node.status({ fill: "green", shape: "dot", text: "connected" });
    });

    sockets[node.name].on('disconnect', () => {
      node.send({ payload: { socketId: node.name, status: 'disconnected' } });
      node.status({ fill: 'red', shape: 'ring', text: 'disconnected' });
    });

    sockets[node.name].on('connect_error', (err) => {
      if (err) {
        node.status({ fill: 'red', shape: 'ring', text: 'disconnected' });
        node.send({ payload: { socketId: node.name, status: 'disconnected' } });
        node.error(err);
      }
    });

    this.on('close', (removed, done) => {
      sockets[node.name].disconnect();
      node.status({});
      if (removed) {
        delete sockets[node.name];
      }
      done();
    });
  }
  RED.nodes.registerType('socketio-connector', SocketIOConnector);

  /* sckt listener*/
  function SocketIOListener(n) {
    RED.nodes.createNode(this, n);
    this.name = n.name;
    this.eventName = n.eventname;
    this.socketId = null;

    var node = this;

    node.on('input', (msg) => {
      node.socketId = msg.payload.socketId;
      if (msg.payload.status == 'connected') {
        node.status({ fill: 'green', shape: 'dot', text: 'listening' });
        if (!sockets[node.socketId].hasListeners(node.eventName)) {
          sockets[node.socketId].on(node.eventName, function (data) {
            node.send({ payload: data });
          });
        }
      } else {
        node.status({ fill: 'red', shape: 'ring', text: 'disconnected' });
        if (sockets[node.socketId].hasListeners(node.eventName)) {
          sockets[node.socketId].removeListener(node.eventName, function () { });
        }
      }
    });

    node.on('close', (done) => {
      if (sockets[node.socketId].hasListeners(node.eventName)) {
        sockets[node.socketId].removeListener(node.eventName);
      }
      node.status({});
      done();
    });
  }
  RED.nodes.registerType('socketio-listener', SocketIOListener);

  /* sckt emitter*/
  function SocketIOEmitter(n) {
    RED.nodes.createNode(this, n);
    this.name = n.name;
    this.socketId = null;

    let node = this;

    node.on('input', (msg) => {
      if (!msg.connectionName) {
        throw 'msg.connectionName undefined! Please place connectionName to msg object';
      }
      if (!msg.eventName) {
        throw 'msg.eventName undefined! Please place eventName to msg object';
      }
      if (!sockets[msg.connectionName]) {
        throw 'Connection ' + msg.connectionName + ' not exists';
      }
      sockets[msg.connectionName].emit(msg.eventName, msg.payload);
    });
  }
  RED.nodes.registerType('socketio-emitter', SocketIOEmitter);

  function connect(config, force) {
    var uri = 'https://' + config.server;

    var options = {
    };

    if (config.query != '') {
      options.query = config.query;
    }
    if (config.path != '') {
      options.path = config.path;
    }
	  console.log(uri)
	  console.log(options)
    return require('socket.io-client')(uri, options);
  }

  function disconnect(config) {
  }
}
