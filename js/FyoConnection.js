var FYO = FYO || {};

(function () {
    'use strict';

    function FyoConnection(controller, options, cb) {
        var self = this;

        if (!controller) {
            alert('Controller must be specified');
            return;
        }

        options = options || {};

        this.controller = controller;
        this.socket = io();
        this.socket.on('connect', function () {
            self.socket.emit('fyo-client');
            self.OnConnect();
        });

        this.input = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        this.events = new FYO.EventManager();

        this.IOHelper = new FYO.IOHelper({
            orientation: function (gamma, beta, alpha) {
                self.events.trigger('orientation', {
                    gamma: gamma,
                    beta: beta,
                    alpha: alpha
                });
            },
            motion: function (accelerationX, accelerationY, accelerationZ) {
                self.events.trigger('acceleration', {
                    x: accelerationX,
                    y: accelerationY,
                    z: accelerationZ
                });
            }
        });
        
        // var fullscreenImage = document.createElement('img');
        // fullscreenImage.setAttribute('class', 'fyo-fullscreen');
        // fullscreenImage.setAttribute('src', options.fullscreenImage || '/fyogametable/assets/imgs/fullscreen-128.png');
        // fullscreenImage.onmouseup = FYO.IOHelper.FullScreen;
        // document.body.appendChild(fullscreenImage);

        var settings = document.createElement('img');
        settings.setAttribute('class', 'fyo-settings');
        settings.setAttribute('src', options.settingsImage || '/fyogametable/assets/imgs/settings-128.png');

        var settingsWindowEl = document.createElement('div');
        {
            settingsWindowEl.setAttribute('class', 'fyo-settings-window');
            settingsWindowEl.setAttribute('style', 'display: none');
            {
                var settingsWindowInnerEl = document.createElement('div');
                settingsWindowInnerEl.setAttribute('class', 'fyo-settings-window-inner');

                {
                    var headerEl = document.createElement('h1');
                    headerEl.innerText = 'SETTINGS';
                    settingsWindowInnerEl.appendChild(headerEl);

                    var optionsEl = document.createElement('div');
                    optionsEl.setAttribute('class', 'fyo-settings-window-options');
                    {
                        var optEl = document.createElement('div');
                        optEl.setAttribute('class', 'fyo-settings-window-option noselect');
                        optEl.innerText = 'Close Game';
                        optEl.onmouseup = function () {
                            self.Send('AppEndMsg');
                        };
                        optionsEl.appendChild(optEl);
                    }
                    {
                        var optEl = document.createElement('div');
                        optEl.setAttribute('class', 'fyo-settings-window-option noselect');
                        optEl.innerText = 'Fullscreen';
                        optEl.onmouseup = FYO.IOHelper.FullScreen;
                        optionsEl.appendChild(optEl);
                    }
                    settingsWindowInnerEl.appendChild(optionsEl);


                    var closeEl = document.createElement('img');
                    closeEl.setAttribute('class', 'fyo-settings-close');
                    closeEl.setAttribute('src', options.closeImage || '/fyogametable/assets/imgs/close.png');
                    closeEl.onmouseup = function () {
                        settingsWindowEl.setAttribute('style', 'display: none');
                    };
                    settingsWindowInnerEl.appendChild(closeEl);
                }
                settingsWindowEl.appendChild(settingsWindowInnerEl);
            }
            document.body.appendChild(settingsWindowEl);
        }
        settings.onmouseup = function () {
            // display settings window
            settingsWindowEl.setAttribute('style', '');
        };
        document.body.appendChild(settings);

        this.IOHelper.GetDeviceInfo(function (info) {
            self.info = info;
            self.events.trigger('info');
        });

    }

    FyoConnection.prototype = {
        alphabet: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',

        OnConnect: function () {
            var self = this;

            this.IOHelper.GetDeviceInfo(function (info) {
                console.log(info);
                self.info = info;
                self.socket.emit('SGHandshakeIdentMsg', {
                    DeviceId: self.GetClientId(),
                    Controller: self.controller,
                    Info: info
                });
                self.events.trigger('connected');
            });

            this.socket.on('SGRedirectMsg', function (path) {
                if (path == this.controller) {
                    // we're already at this controller
                    return;
                }
                window.location = '/' + path;
            });

            this.socket.on('SGUpdateMsg', function (msg) {
                self.events.trigger('SGUpdateMsg', msg);
                self.events.trigger(msg.MessageType, msg.data);
            });

            this.socket.on('app-ping', function (data) {
                self.socket.emit('app-pong', data);
            });

            this.socket.on('app-latency', function (data) {
                self.events.trigger('app-latency', data);
            });
        },

        GetClientId: function () {
            var clientId = window.localStorage.getItem('clientId');
            if (!clientId) {
                clientId = this.GenUniqueId();
                window.localStorage.setItem('clientId', clientId);
            }
            return clientId;
        },

        GenUniqueId: function() {
            var code = '';
            for (var i = 0; i < 24; i++) {
                code += this.alphabet[Math.floor(Math.random() * (this.alphabet.length - 1))];
            }
            return code;
        },

        Send: function (messageType, data) {
            this.socket.emit('SGUpdateMsg', {
                MessageType: messageType,
                data: data
            });
        },

        SendInput: function () {
            this.Send('Input', {
                'button 0': this.input[0] > 0,
                'button 1': this.input[1] > 0,
                'button 2': this.input[2] > 0,
                'button 3': this.input[3] > 0,
                'button 4': this.input[4] > 0,
                'button 5': this.input[5] > 0,
                'button 6': this.input[6] > 0,
                'button 7': this.input[7] > 0,
                'button 8': this.input[8] > 0,
                'button 9': this.input[9] > 0,
                'axis 0': this.input[10],
                'axis 1': this.input[11],
                'axis 2': this.input[12],
                'axis 3': this.input[13],
                'axis 4': this.input[14],
                'axis 5': this.input[15],
                'axis 6': this.input[16],
                'axis 7': this.input[17]
            });
        },

        SetAxis: function (axis1, val1, axis2, val2) {
            this.input[axis1] = val1;
            if (axis2) {
                this.input[axis2] = val2;
            }
            this.SendInput();
        },

        SetButton: function (btn, state) {
            this.input[btn] = state;
            this.SendInput();
        },

        SetButtonOn: function (btn) {
            this.SetButton(btn, 1);
        },

        SetButtonOff: function (btn) {
            this.SetButton(btn, 0);
        },

        AddVisualLatency: function () {
            var ping = document.createElement('h3');
            ping.setAttribute('id', 'ping-message');
            document.body.appendChild(ping);

            this.on('app-latency', function (data) {
                ping.innerText = Math.floor(data.average);
            });
        },

        TakePicture: function (ev) {
            var self = this;
            var picture = new FYO.Picture(function (data) {
                self.Send(ev || 'Picture', data);
            });
        },

        // Event Manager - easy access
        on: function (e, f) {
            return this.events.on(e, f);
        },

        remove: function (e, f) {
            return this.events.remove(e, f);
        }
    };

    FYO.FyoConnection = FyoConnection;
    FYO.BUTTON = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    FYO.AXIS = [10, 11, 12, 13, 14, 15, 16, 17];
})();
