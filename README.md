# Fyo Game Table Controller API
Fyo Game Table javascript API for creating Socket Game Pad Controllers


## Install

```
bower install fyogametable
```

![Base Controller Example](http://i.imgur.com/SgJQv3Z.png)

## Usage

### Connection and basic messages
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

### Rendered Controls

```javascript
var thumbstick = new FYO.ThumbStick3D(connecter, {
    side: false,
    container: 'mainContainer',
    onmoved: function (data) {
        connecter.SetAxis(FYO.AXIS[0], data.x, FYO.AXIS[1], -data.y);
    }
});

var button = new FYO.Button3D(connecter, {
    container: 'mainContainer',
    image: '/fyogametable/assets/imgs/Blue_B.png',
    ondown: function () {
        connecter.SetButtonOn(FYO.BUTTON[0]);
    },
    onup: function () {
        connecter.SetButtonOff(FYO.BUTTON[0]);
    }
});
```
