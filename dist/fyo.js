var FYO = FYO || {};

(function () {
    'use strict';

    function Button3D(connector, options) {
        this.connector = connector;

        this.element = null;
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.mouseX = 0; this.mouseY = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.thumbObj = null;
        this.events = new FYO.EventManager();

        if (options.ondown) {
            this.events.on('down', options.ondown);
        }
        if (options.onup) {
            this.events.on('up', options.onup);
        }

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

        this.Init(options || { color: 0x222222 });
        this.Animate();
    }

    Button3D.prototype = {

        element: null,
        camera: null,
        scene: null,
        renderer: null,
        mouseX: 0, mouseY: 0,
        windowHalfX: window.innerWidth / 2,
        windowHalfY: window.innerHeight / 2,
        thumbObj: null,
        events: null,

        on: function (e, f) {
            return this.events.on(e, f);
        },

        remove: function (e, f) {
            return this.events.remove(e, f);
        },

        clear: function (e) {
            return this.events.clear(e);
        },

        Set: function (x, y, w, h) {
            this.positioner.Set(x, y, w, h);
            this.onWindowResize();
        },

        SetAlign: function (h, v) {
            this.positioner.align.horizontal = h;
            this.positioner.align.vertical = v;
        },

        Reposition: function (x, y, w, h) {
            this.onWindowResize(x, y, w, h);
        },

        Init: function (options) {
            var self = this;

            this.element = document.createElement('div');
            this.positioner = new FYO.Positioner(this.element);
            this.element.setAttribute('style', 'position: absolute; top: 0; left: 0; right: 100%; bottom: 0;');

            var containerParent = document.body;
            if (options.container) {
                containerParent = document.getElementById(options.container);
            }
            containerParent.appendChild(this.element);

            // scene
            this.scene = new THREE.Scene();
            var ambient = new THREE.AmbientLight(0x101030);
            this.scene.add(ambient);
            var directionalLight = new THREE.DirectionalLight(0xffeedd);
            directionalLight.position.set(1, 10, 1);
            this.scene.add(directionalLight);


            this.camera = new THREE.PerspectiveCamera(45, this.element.clientWidth / this.element.clientHeight, 1, 2000);
            this.camera.position.y = 3.3;
            this.camera.position.z = 1;
            this.camera.lookAt(this.scene.position);


            // texture
            var manager = new THREE.LoadingManager();
            manager.onProgress = function (/*item, loaded, total*/) {

            };

            var onProgress = function (/*xhr*/) {
                //if (xhr.lengthComputable) {
                //    var percentComplete = xhr.loaded / xhr.total * 100;
                //    console.log(Math.round(percentComplete, 2) + '% downloaded');
                //}
            };
            var onError = function (/*xhr*/) { };

            var modelLoader = new THREE.OBJLoader(manager);
            if (options.color) {
                modelLoader.load(options.model || '/fyogametable/assets/objs/Button.obj', function (object) {
                    object.traverse(function (child) {
                        console.log(child);
                        if (child instanceof THREE.Mesh) {
                            child.material.color = new THREE.Color(options.color || 0x221111);
                        }
                    });
                    object.position.y = 0;
                    self.thumbObj = object;
                    self.scene.add(object);
                }, onProgress, onError);
            } else if(options.image) {

                var texture = new THREE.Texture();
                var loader = new THREE.ImageLoader(manager);
                loader.load(options.image || '/fyogametable/imgs/Red_A.png', function (image) {
                    texture.image = image;
                    texture.needsUpdate = true;
                });
                modelLoader.load(options.model || '/fyogametable/assets/objs/ButtonTex.obj', function (object) {
                    object.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material.map = texture;
                        }
                    });
                    object.position.y = 0;
                    self.thumbObj = object;
                    self.scene.add(object);
                }, onProgress, onError);
            }

            //
            this.renderer = new THREE.WebGLRenderer({ alpha: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
            this.renderer.setClearColor(0x000000, 0);
            this.element.appendChild(this.renderer.domElement);
            this.element.addEventListener('mousemove', function (e) { self.onMouseMove(e); }, false);
            this.element.addEventListener('mousedown', function (e) { self.onMouseDown(e); }, false);
            this.element.addEventListener('mouseup', function (e) { self.onMouseUp(e); }, false);
            this.element.addEventListener('mouseleave', function (e) { self.onMouseLeave(e); }, false);
            this.element.addEventListener('touchmove', function (e) { self.onTouchMove(e); }, false);
            this.element.addEventListener('touchstart', function (e) { self.onTouchStart(e); }, false);
            this.element.addEventListener('touchend', function (e) { self.onTouchDone(e); }, false);
            //
            window.addEventListener('resize', function (e) { self.onWindowResize(e); }, false);
        },

        onWindowResize: function () {
            this.elementHalfX = this.element.clientWidth / 2;
            this.elementHalfY = this.element.clientHeight / 2;
            this.camera.aspect = this.elementHalfX / this.elementHalfY;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
        },
        onMouseMove: function (event) {
            event.preventDefault();
            this.mouseX = event.offsetX;
            this.mouseY = event.offsetY;
        },
        onMouseDown: function (event) {
            event.preventDefault();
            this.mouseDown = true;
            this.events.trigger('down', true);
        },
        onMouseUp: function (event) {
            event.preventDefault();
            this.mouseDown = false;
            this.events.trigger('up', true);
        },
        onMouseLeave: function (event) {
            event.preventDefault();
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
        },
        onTouchStart: function () {
            navigator.vibrate(10);
            this.mouseDown = true;
            this.events.trigger('down', true);
        },
        onTouchMove: function (event) {
            event.preventDefault();
            var rect = this.element.getBoundingClientRect();
            for (var i = 0; i < event.touches.length; i++) {
                // determine if touch is within rect
                var touch = event.touches[i];

                if (touch.pageX >= rect.left && touch.pageX <= rect.right && touch.pageY >= rect.top && touch.pageY <= rect.bottom) {
                    this.mouseX = touch.pageX - rect.left;
                    this.mouseY = touch.pageY - rect.top;
                }
            }
        },
        onTouchDone: function (event) {
            event.preventDefault();
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
            //navigator.vibrate(10);
            this.mouseDown = false;
            this.events.trigger('up', true);
        },

        Animate: function () {
            var self = this;
            requestAnimationFrame(function () {
                self.Animate();
            });
            this.Render();
        },

        Render: function () {

            if (this.thumbObj !== null) {
                this.thumbObj.scale.y = this.mouseDown ? 0.75 : 1.0;
            }

            this.renderer.render(this.scene, this.camera);
        }
    };

    FYO.Button3D = Button3D;
})();
var FYO = FYO || {};

(function () {
    'use strict';

    function EventManager() {
        this.onEvents = {};
    }

    EventManager.prototype = {
        onEvents: {},

        on: function (e, f) {
            if (!this.onEvents[e]) {
                this.onEvents[e] = [];
            }
            this.onEvents[e].push(f);
        },

        remove: function (e, f) {
            if (!this.onEvents[e]) {
                return;
            }

            for (var i = 0; i < this.onEvents[e].length; i++) {
                if (this.onEvents[e][i] === f) {
                    this.onEvents[e].splice(i, 1);
                    return true;
                }
            }

            return false;
        },

        clear: function (e) {
            delete this.onEvents[e];
        },

        trigger: function (e, arg) {
            if (!this.onEvents[e]) {
                return;
            }

            for (var i = 0; i < this.onEvents[e].length; i++) {
                this.onEvents[e][i](arg);
            }
        }
    };

    FYO.EventManager = EventManager;
})();
var FYO = FYO || {};

(function () {
    'use strict';

    function FyoConnection(controller) {
        var self = this;

        this.controller = controller;
        this.socket = io();
        this.socket.on('connect', function () {
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

        var fullscreenImage = document.createElement('img');
        fullscreenImage.setAttribute('class', 'fyo-fullscreen');
        fullscreenImage.setAttribute('src', '/fyogametable/imgs/fullscreen-128.png');
        fullscreenImage.onclick = FYO.IOHelper.FullScreen;
        document.body.appendChild(fullscreenImage);
    }

    FyoConnection.prototype = {
        alphabet: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',

        OnConnect: function () {
            var self = this;

            this.socket.emit('SGHandshakeIdentMsg', {
                DeviceId: self.GetClientId(),
                Controller: self.controller
            });

            this.socket.on('Redirect', function (path) {
                window.location = '/' + path;
            });

            this.socket.on('SGUpdateMsg', function (data) {
                self.events.trigger('SGUpdateMsg', data);
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

var FYO = FYO || {};

(function () {
    'use strict';

    function IOHelper(options) {

        if (window.DeviceOrientationEvent) {            
            // Listen for the event and handle DeviceOrientationEvent object
            window.addEventListener('deviceorientation', function(ev) {
                if (options && options.orientation) {
                    options.orientation(ev.gamma, ev.beta, ev.alpha);
                }
            }, false);
        }

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', function(ev) {
                if (options && options.motion) {
                    options.motion(ev.acceleration.x, ev.acceleration.y, ev.acceleration.z);
                }
            }, false);
        }
    }

    IOHelper.FullScreen = function () {
        // Supports most browsers and their versions.
        var requestMethod = document.body.requestFullScreen || document.body.webkitRequestFullScreen || document.body.mozRequestFullScreen || document.body.msRequestFullScreen;
        var requestExitMethod = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;

        if (requestMethod) { // Native full screen.
            if (!document.fullscreenElement) {
                // no full screen element found, go full screen
                requestMethod.call(document.body);
                document.fullscreenElement = document.body;
            } else {
                requestExitMethod.call(document);
                document.fullscreenElement = null;
            }
        } else if (typeof window.ActiveXObject !== 'undefined') { // Older IE.
            var wscript = new ActiveXObject('WScript.Shell');
            if (wscript !== null) {
                wscript.SendKeys('{F11}');
            }
        }
    };

    IOHelper.prototype = {

    };

    FYO.IOHelper = IOHelper;
})();
var FYO = FYO || {};

(function () {
    'use strict';

    function Positioner(element, container) {
        this.container = container || window;
        this.element = element;
        this.align = {
            horizontal: 1,
            vertical: 1
        };

        this.x = 0; this.y = 0; this.w = 0; this.h = 0;

        var self = this;
        window.addEventListener('resize', function () {
            self.Set(self.x, self.y, self.w, self.h);
        }, false);
    }

    Positioner.prototype = {
        Set: function (x, y, w, h) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;

            var xPos = 0;
            if (this.isPercentage(x)) {
                switch (this.align.horizontal) {
                    case 0: {
                        xPos = (this.container.innerWidth * this.getPercentage(x));
                        break;
                    }
                    case 1: {
                        xPos = (this.container.innerWidth * this.getPercentage(x)) - (w / 2.0);
                        break;
                    }
                    case 2: {
                        xPos = (this.container.innerWidth * this.getPercentage(x)) - w;
                        break;
                    }
                }
            } else {
                xPos = this.number(x);
            }

            var yPos = 0;
            if (this.isPercentage(y)) {
                switch (this.align.vertical) {
                    case 0: {
                        yPos = (this.container.innerHeight * this.getPercentage(y));
                        break;
                    }
                    case 1: {
                        yPos = (this.container.innerHeight * this.getPercentage(y)) - (h / 2.0);
                        break;
                    }
                    case 2: {
                        yPos = (this.container.innerHeight * this.getPercentage(y)) - h;
                        break;
                    }
                }
            } else {
                yPos = this.number(y);
            }
            
            this.element.setAttribute('style', 'position: absolute; top: ' + yPos + 'px; left: ' + xPos + 'px; right: ' + (xPos + w) + 'px; bottom: ' + (yPos + h) + 'px; width: ' + w + 'px; height: ' + h + 'px;');
        },

        isPercentage: function (x) {
            return x.indexOf('%') > -1;
        },

        getPercentage: function (x) {
            return parseFloat(this.number(x)) / 100.0;
        },

        number: function (x) {
            return x.split('%')[0].split('px')[0];
        }
    };

    FYO.Positioner = Positioner;
})();
var FYO = FYO || {};

(function () {
    'use strict';

    function ThumbStick3D(connector, options) {
        
        this.connector = connector;

        this.element = null;
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.mouseX = 0; this.mouseY = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.thumbObj = null;

        this.x = 0;
        this.y = 0;

        this.events = new FYO.EventManager();

        if (options.onmoved) {
            this.events.on('moved', options.onmoved);
        }

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

        this.Init(options);
        this.Animate();
    }

    ThumbStick3D.prototype = {

        element: null,
        camera: null,
        scene: null,
        renderer: null,
        mouseX: 0, mouseY: 0,
        windowHalfX: window.innerWidth / 2,
        windowHalfY: window.innerHeight / 2,
        thumbObj: null,
        events: null,

        on: function (e, f) {
            return this.events.on(e, f);
        },

        remove: function (e, f) {
            return this.events.remove(e, f);
        },

        clear: function (e) {
            return this.events.clear(e);
        },

        Reposition: function (x, y, w, h) {
            var style = 'position: absolute; top: ' + y + 'px;';
            style += 'left: ' + x + 'px;';
            style += 'right: ' + (x + w) + 'px;';
            style += 'bottom: ' + (y + h) + 'px;';
            style += 'width: ' + w + 'px;';
            style += 'height: ' + h + 'px;';

            this.element.setAttribute('style', style);
            this.onWindowResize();
        },

        Init: function (options) {
            var self = this;

            this.element = document.createElement('div');

            // TODO: (garrett) This needs to be abstracted out like the button
            if (options.side) {
                this.element.setAttribute('style', 'position: absolute; top: 0; left: 50%; right: 0; bottom: 30%;');
            } else {
                this.element.setAttribute('style', 'position: absolute; top: 0; left: 0; right: 50%; bottom: 0;');
            }

            var containerParent = document.body;
            if (options.container) {
                containerParent = document.getElementById(options.container);
            }
            containerParent.appendChild(this.element);
            
            // scene
            this.scene = new THREE.Scene();
            var ambient = new THREE.AmbientLight(0x101030);
            this.scene.add(ambient);
            var directionalLight = new THREE.DirectionalLight(0xffeedd);
            directionalLight.position.set(1, 10, 1);
            this.scene.add(directionalLight);


            this.camera = new THREE.PerspectiveCamera(45, this.element.clientWidth / this.element.clientHeight, 1, 2000);
            this.camera.position.y = 5;
            this.camera.position.z = 1;
            this.camera.lookAt(this.scene.position);


            // texture
            var manager = new THREE.LoadingManager();
            manager.onProgress = function (item, loaded, total) {
                console.log(item, loaded, total);
            };

            var onProgress = function () {
                //if (xhr.lengthComputable) {
                //    var percentComplete = xhr.loaded / xhr.total * 100;
                //    console.log(Math.round(percentComplete, 2) + '% downloaded');
                //}
            };
            var onError = function (xhr) { console.log(xhr); };

            // model
            var loader = new THREE.OBJLoader(manager);
            loader.load('/fyogametable/assets/objs/leftThumb.obj', function (object) {
                object.traverse(function (child) {
                    //console.log(child);
                    if (child instanceof THREE.Mesh) {
                        if (child.material.materials) {
                            child.material.materials[0].color = new THREE.Color(0xcccccc);
                            child.material.materials[1].color = new THREE.Color(0x222222);
                        } else {
                            child.material.color = new THREE.Color(0x222222);
                        }
                    }
                });
                object.position.y = 0;
                self.thumbObj = object;
                self.scene.add(object);
            }, onProgress, onError);
            loader.load('/fyogametable/assets/objs/leftThumbBase.obj', function (object) {
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material.color = new THREE.Color(0x222222);
                    }
                });
                object.position.y = 0;
                self.scene.add(object);
            }, onProgress, onError);

            //
            this.elementHalfX = this.element.clientWidth / 2;
            this.elementHalfY = this.element.clientHeight / 2;
            this.renderer = new THREE.WebGLRenderer({ alpha: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
            this.renderer.setClearColor(0x000000, 0);
            this.element.appendChild(this.renderer.domElement);
            this.element.addEventListener('mousemove', function (e) { self.onMouseMove(e); }, false);
            this.element.addEventListener('mouseleave', function (e) { self.onMouseLeave(e); }, false);
            this.element.addEventListener('touchmove', function (e) { self.onTouchMove(e); }, false);
            this.element.addEventListener('touchstart', function (e) { self.onTouchStart(e); }, false);
            this.element.addEventListener('touchend', function (e) { self.onTouchDone(e); }, false);
            //
            window.addEventListener('resize', function (e) { self.onWindowResize(e); }, false);
        },

        onWindowResize: function () {
            this.elementHalfX = this.element.clientWidth / 2;
            this.elementHalfY = this.element.clientHeight / 2;
            this.camera.aspect = this.elementHalfX / this.elementHalfY;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
        },
        onMouseMove: function (event) {
            event.preventDefault();
            this.mouseX = event.offsetX;
            this.mouseY = event.offsetY;
            this._update();
        },
        onMouseLeave: function (event) {
            event.preventDefault();
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
            this._update();
        },
        onTouchStart: function () {
            navigator.vibrate(10);
        },
        onTouchMove: function (event) {
            event.preventDefault();
            var rect = this.element.getBoundingClientRect();
            for (var i = 0; i < event.touches.length; i++) {
                // determine if touch is within rect
                var touch = event.touches[i];

                if (touch.pageX >= rect.left && touch.pageX <= rect.right && touch.pageY >= rect.top && touch.pageY <= rect.bottom) {
                    this.mouseX = touch.pageX - rect.left;
                    this.mouseY = touch.pageY - rect.top;
                    this._update();
                }
            }
        },
        onTouchDone: function (event) {
            event.preventDefault();
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
            this._update();
            navigator.vibrate(10);
        },

        _update: function () {

            var _y = (this.mouseY - this.elementHalfY) / this.elementHalfY;
            var _x = (this.mouseX - this.elementHalfX) / this.elementHalfX;
            this.x = -Math.sin(_x);
            this.y = Math.sin(_y);
            var len = Math.sqrt((this.x * this.x + this.y * this.y));
            if (len > 1) {
                this.x /= len;
                this.y /= len;
            }


            this.events.trigger('moved', {
                x: -this.x,
                y: -this.y
            });
        },

        Animate: function () {
            var self = this;
            requestAnimationFrame(function () {
                self.Animate();
            });
            this.Render();
        },

        Render: function () {

            if (this.thumbObj !== null) {
                this.thumbObj.rotation.x = this.y / 2.0;
                this.thumbObj.rotation.z = this.x / 2.0;
            }

            this.renderer.render(this.scene, this.camera);
        }
    };

    FYO.ThumbStick3D = ThumbStick3D;
})();