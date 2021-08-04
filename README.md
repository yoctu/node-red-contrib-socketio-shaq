# node-red-contrib-socketio-shaq
---

## Nodes

1. Shaq Socket.IO Connector
2. Shaq Socket.IO Listener
3. Shaq Socket.IO Emitter

## How to use

> Socket.IO Connector -> Socket.IO Listener -> Payload

## DEMO Flow 

```
[{"id":"e16cbd99.2054e","type":"tab","label":"DEMO","disabled":false,"info":""},{"id":"6eefe800.a47ee8","type":"socketio-connector","z":"e16cbd99.2054e","server":"$string(\"https://DEMO.shaq.us.yoctu.solutions\")","key":"","email":"","path":"/shaq","name":"DEMO","x":290,"y":220,"wires":[["22c4343d.adda1c"]]},{"id":"22c4343d.adda1c","type":"socketio-listener","z":"e16cbd99.2054e","eventname":"$string(\"DEMO\")","name":"","x":620,"y":220,"wires":[["a1ac87ab.cc1be8"]]},{"id":"94e1b038.1079d","type":"socketio-listener","z":"e16cbd99.2054e","eventname":"$string(\"esm_stats\")","name":"esm_stats","x":610,"y":100,"wires":[["7aa5fdb8.edb374"]]},{"id":"40a264d4.b1aefc","type":"socketio-connector","z":"e16cbd99.2054e","server":"$string(\"https://DEMO.shaq.us.yoctu.solutions\")","key":"","email":"","path":"/","name":"DEMO","x":270,"y":100,"wires":[["94e1b038.1079d"]]},{"id":"a1ac87ab.cc1be8","type":"debug","z":"e16cbd99.2054e","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":830,"y":220,"wires":[]},{"id":"7aa5fdb8.edb374","type":"debug","z":"e16cbd99.2054e","name":"","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":830,"y":100,"wires":[]}]
```
