var FYO = FYO || {};

(function () {
    'use strict';

    function Button3D(connector, options) {
        options = options || {};

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

    function FyoConnection(controller, options) {
        var self = this;

        options = options || {};

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
        fullscreenImage.setAttribute('src', options.fullscreenImage || '/fyogametable/assets/imgs/fullscreen-128.png');
        fullscreenImage.onclick = FYO.IOHelper.FullScreen;
        document.body.appendChild(fullscreenImage);
    }

    FyoConnection.prototype = {
        alphabet: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',

        OnConnect: function () {
            var self = this;

            this.socket.emit('SGHandshakeIdentMsg', {
                DeviceId: self.GetClientId(),
                Controller: self.controller,
                Info: {
                    browser: platform.name,
                    version: platform.version,
                    manufacturer: platform.manufacturer,
                    product: platform.product,
                    os: {
                        family: platform.os.family,
                        version: platform.os.version,
                        architecture: platform.os.architecture
                    },
                    description: platform.description,
                    layout: platform.layout,
                    ua: platform.ua,
                    resolution: {
                        width: window.screen.width,
                        height: window.screen.height,
                        pixelRatio: window.devicePixelRatio
                    }
                }
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
        options = options || {};

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
        options = options || {};

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
/*!
 * Platform.js <https://mths.be/platform>
 * Copyright 2014-2016 Benjamin Tan <https://demoneaux.github.io/>
 * Copyright 2011-2013 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <https://mths.be/mit>
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object. */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object. */
  var oldRoot = root;

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Regular expression to detect Opera. */
  var reOpera = /\bOpera/;

  /** Possible global object. */
  var thisBinding = this;

  /** Used for native method references. */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values. */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // Platform tokens are defined at:
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '10.0': '10',
      '6.4':  '10 Technical Preview',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // Detect Windows version from platform tokens.
    if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) &&
        (data = data[/[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // Correct character case and cleanup string.
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object. */
    var context = root;

    /** Used to flag when a custom context is provided. */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // Juggle arguments.
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object. */
    var nav = context.navigator || {};

    /** Browser user agent string. */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope]. */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome. */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts. */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environments. */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino. */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha. */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta. */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object. */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based).
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]`. */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime. */
    var data;

    /** The CPU architecture. */
    var arch = ua;

    /** Platform description array. */
    var description = [];

    /** Platform alpha/beta indicator. */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform. */
    var useFeatures = ua == userAgent;

    /** The browser/environment version. */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important). */
    var layout = getLayout([
      { 'label': 'EdgeHTML', 'pattern': 'Edge' },
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important). */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Electron',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      { 'label': 'Microsoft Edge', 'pattern': 'Edge' },
      'Midori',
      'Nook Browser',
      'PaleMoon',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      { 'label': 'Samsung Internet', 'pattern': 'SamsungBrowser' },
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'Sunrise',
      'Swiftfox',
      'Waterfox',
      'WebPositive',
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chrome',
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'Firefox for iOS', 'pattern': 'FxiOS' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important). */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      { 'label': 'Galaxy S5', 'pattern': 'SM-G900' },
      { 'label': 'Galaxy S6', 'pattern': 'SM-G920' },
      { 'label': 'Galaxy S6 Edge', 'pattern': 'SM-G925' },
      { 'label': 'Galaxy S7', 'pattern': 'SM-G930' },
      { 'label': 'Galaxy S7 Edge', 'pattern': 'SM-G935' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nexus',
      'Nook',
      'PlayBook',
      'PlayStation Vita',
      'PlayStation',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers. */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Archos': {},
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1, 'Nexus': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation': 1, 'PlayStation Vita': 1 }
    });

    /* Detectable operating systems (order is important). */
    var os = getOS([
      'Windows Phone',
      'Android',
      'CentOS',
      { 'label': 'Chrome OS', 'pattern': 'CrOS' },
      'Debian',
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'OpenBSD',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Tizen',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // Lookup the manufacturer by product or scan the UA for the manufacturer.
        return result || (
          value[product] ||
          value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // Split by forward slash and append product version if needed.
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // Correct character case and cleanup string.
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // Convert layout to an array so we can add extra details.
    layout && (layout = [layout]);

    // Detect product names that contain their manufacturer's name.
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    }
    // Clean up Google TV.
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // Detect simulators.
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // Detect IE Mobile 11.
    if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
      data = parse(ua.replace(/like iPhone OS/, ''));
      manufacturer = data.manufacturer;
      product = data.product;
    }
    // Detect iOS.
    else if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // Detect Kubuntu.
    else if (name == 'Konqueror' && !/buntu/i.test(os)) {
      os = 'Kubuntu';
    }
    // Detect Android browsers.
    else if ((manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
        (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // Detect Silk desktop/accelerated modes.
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // Detect PaleMoon identifying as Firefox.
    else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
      description.push('identifying as Firefox ' + data[1]);
    }
    // Detect Firefox OS and products running Firefox.
    else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
      os || (os = 'Firefox OS');
      product || (product = data[1]);
    }
    // Detect false positives for Firefox/Safari.
    else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // Escape the `/` for Firefox 1.
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // Clear name of false positives.
        name = null;
      }
      // Reassign a generic name.
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // Add Chrome version to description for Electron.
    else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
      description.push('Chromium ' + data);
    }
    // Detect non-Opera (Presto-based) versions (order is important).
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // Detect stubborn layout engines.
    if ((data =
          layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' ||
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') ||
          layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'
        )) {
      layout = [data];
    }
    // Detect Windows Phone 7 desktop mode.
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // Detect Windows Phone 8.x desktop mode.
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8.x';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // Detect IE 11 identifying as other browsers.
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (name) {
        description.push('identifying as ' + name + (version ? ' ' + version : ''));
      }
      name = 'IE';
      version = data[1];
    }
    // Leverage environment features.
    if (useFeatures) {
      // Detect server-side environments.
      // Rhino has a global function while others have a global object.
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (isModuleScope && isHostType(context, 'system') && (data = [context.system])[0]) {
          os || (os = data[0].os || null);
          try {
            data[1] = context.require('ringo/engine').version;
            version = data[1].join('.');
            name = 'RingoJS';
          } catch(e) {
            if (data[0].global.system == context.system) {
              name = 'Narwhal';
            }
          }
        }
        else if (
          typeof context.process == 'object' && !context.process.browser &&
          (data = context.process)
        ) {
          if (typeof data.versions == 'object') {
            if (typeof data.versions.electron == 'string') {
              description.push('Node ' + data.versions.node);
              name = 'Electron';
              version = data.versions.electron;
            } else if (typeof data.versions.nw == 'string') {
              description.push('Chromium ' + version, 'Node ' + data.versions.node);
              name = 'NW.js';
              version = data.versions.nw;
            }
          } else {
            name = 'Node.js';
            arch = data.arch;
            os = data.platform;
            version = /[\d.]+/.exec(data.version)
            version = version ? version[0] : 'unknown';
          }
        }
        else if (rhino) {
          name = 'Rhino';
        }
      }
      // Detect Adobe AIR.
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // Detect PhantomJS.
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // Detect IE compatibility modes.
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // We're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode.
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      // Detect IE 11 masking as other browsers.
      else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
        description.push('masking as ' + name + ' ' + version);
        name = 'IE';
        version = '11.0';
        layout = ['Trident'];
        os = 'Windows';
      }
      os = os && format(os);
    }
    // Detect prerelease phases.
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // Detect Firefox Mobile.
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // Obscure Maxthon's unreliable version.
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // Detect Xbox 360 and Xbox One.
    else if (/\bXbox\b/i.test(product)) {
      if (product == 'Xbox 360') {
        os = null;
      }
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // Add mobile postfix.
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // Detect IE platform preview.
    else if (name == 'IE' && useFeatures) {
      try {
        if (context.external === null) {
          description.unshift('platform preview');
        }
      } catch(e) {
        description.unshift('embedded');
      }
    }
    // Detect BlackBerry OS version.
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // Detect Opera identifying/masking itself as another browser.
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && product != 'Wii' && (
          (useFeatures && opera) ||
          (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
          (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
          (name == 'IE' && (
            (os && !/^Win/.test(os) && version > 5.5) ||
            /\bWindows XP\b/.test(os) && version > 8 ||
            version == 8 && !/\bTrident\b/.test(ua)
          ))
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {
      // When "identifying", the UA contains both Opera and the other browser's name.
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // When "masking", the UA contains only the other browser's name.
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // Detect WebKit Nightly and approximate Chrome/Safari versions.
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // Correct build number for numeric comparison.
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // Nightly builds are postfixed with a "+".
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // Clear incorrect browser versions.
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // Use the full Chrome version when available.
      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // Detect Blink layout engine.
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
        layout = ['Blink'];
      }
      // Detect JavaScriptCore.
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // Add the postfix of ".x" or "+" for approximate versions.
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // Obscure version for some Safari 1-2 releases.
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    }
    // Detect Opera desktop modes.
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // Detect Chrome desktop mode.
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // Strip incorrect OS versions.
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // Add layout engine.
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(name) && layout[1])) {
      // Don't add layout details to description if they are falsey.
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // Combine contextual information.
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // Append manufacturer to description.
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // Append product to description.
    if (product) {
      description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
    }
    // Parse the OS into an object.
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // Add browser/OS architecture.
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }
    // Chrome 39 and above on OS X is always 64-bit.
    else if (
        os && /^OS X/.test(os.family) &&
        name == 'Chrome' && parseFloat(version) >= 39
    ) {
      os.architecture = 64;
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * The list of common layout engines include:
     * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * The list of manufacturers include:
     * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
     * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
     * "Nokia", "Samsung" and "Sony"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * The list of common browser names include:
     * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
     * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
     * "Opera Mini" and "Opera"
     *
     * Mobile versions of some browsers have "Mobile" appended to their name:
     * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * The list of common products include:
     *
     * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
     * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // Export platform.
  var platform = parse();

  // Some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose platform on the global object to prevent errors when platform is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    root.platform = platform;

    // Define as an anonymous module so platform can be aliased through path mapping.
    define(function() {
      return platform;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for CommonJS support.
    forOwn(platform, function(value, key) {
      freeExports[key] = value;
    });
  }
  else {
    // Export to the global object.
    root.platform = platform;
  }
}.call(this));
