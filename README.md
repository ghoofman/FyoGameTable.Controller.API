# Fyo Game Table Controller API
Fyo Game Table javascript API for creating Socket Game Pad Controllers


## Install

```
bower install fyogametable
```

## Usage

```javascript
var connecter = new FYO.FyoConnection('base_controller' /*required*/);

// Example Message to send
connector.Send('Hello', { world: 1337 });

// Example Receive
connector.on('SGUpdateMsg', function(packet) {
  if(packet.MessageType == 'Points') {
    alert('I got ' + packet.data + ' points!');
  }
});

```
