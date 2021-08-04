module.exports = function (RED) {
  'use strict';
  let sockets = {};

  function SocketIOConnector(n) {
    RED.nodes.createNode(this, n);
    this.server = RED.nodes.getNode(n.server);
    this.name = n.name;
    this.sockets = sockets;
    let node = this;

    let preparedStatExpression = RED.util.prepareJSONataExpression(n.server, null);
    RED.util.evaluateJSONataExpression(preparedStatExpression, {}, (err, value) => {
      var options = {
        query: {
          email: n.email,
          key: n.key
        }
      };
      sockets[node.name] = require('socket.io-client')(value + n.path, options);
      sockets[node.name].on('connect', () => {
        node.send({
          payload: {
            socketId: node.name,
            status: 'connected'
          }
        });
        node.status({
          fill: "green",
          shape: "dot",
          text: "connected"
        });
      });

      sockets[node.name].on('disconnect', (value) => {
        node.send({
          payload: {
            socketId: node.name,
            status: 'disconnected'
          }
        });
        node.status({
          fill: 'red',
          shape: 'ring',
          text: 'disconnected'
        });
      });

      sockets[node.name].on('connect_error', (err) => {
        if (err) {
          node.status({
            fill: 'red',
            shape: 'ring',
            text: 'error'
          });
          node.send({
            payload: {
              socketId: node.name,
              status: 'error'
            }
          });
          node.error(err);
        }
      });
    });

    this.on('close', (removed, done) => {
      sockets[node.name].disconnect();
      node.status({
        fill: 'red',
        shape: 'ring',
        text: 'closed'
      });
      if (removed) {
        delete sockets[node.name];
      }
      done();
    });
  }
  RED.nodes.registerType('socketio-connector', SocketIOConnector);

  function SocketIOListener(n) {
    RED.nodes.createNode(this, n);
    this.name = n.name;
    this.eventName = n.eventname;
    this.socketId = null;
    var node = this;

    node.on('input', (msg) => {
      node.socketId = msg.payload.socketId;
      let preparedStatExpression = RED.util.prepareJSONataExpression(node.eventName, null);
      RED.util.evaluateJSONataExpression(preparedStatExpression, {}, (err, value) => {
        if (msg.payload.status == 'connected') {
          node.status({
            fill: 'green',
            shape: 'dot',
            text: 'listening'
          });
          if (!sockets[node.socketId].hasListeners(value)) {
            sockets[node.socketId].on(value, function (data) {
              node.send({
                payload: data
              });
            });
          }
        } else {
          node.status({
            fill: 'red',
            shape: 'ring',
            text: 'disconnected'
          });
          if (sockets[node.socketId].hasListeners(value)) {
            sockets[node.socketId].removeListener(value, function () {});
          }
        }
      })
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

  function SocketIOEmitter(n) {
    RED.nodes.createNode(this, n);
    this.name = n.name;
    this.socketId = null;
    let node = this;

    node.on('input', (msg) => {
      if (!msg.connectionName) throw 'msg.connectionName undefined! Please place connectionName to msg object';
      if (!msg.eventName) throw 'msg.eventName undefined! Please place eventName to msg object';
      if (!sockets[msg.connectionName]) throw 'Connection ' + msg.connectionName + ' not exists';
      sockets[msg.connectionName].emit(msg.eventName, msg.payload);
    });
  }
  RED.nodes.registerType('socketio-emitter', SocketIOEmitter);
}