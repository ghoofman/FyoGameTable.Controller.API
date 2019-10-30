var FYO = FYO || {};

(function () {
    'use strict';

    function Button(connector, options) {
        options = options || {};

        this.connector = connector;

        this.element = null;
        this.mouseX = 0; this.mouseY = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.events = new FYO.EventManager();

        if (options.ondown) {
            this.events.on('down', options.ondown);
        }
        if (options.onup) {
            this.events.on('up', options.onup);
        }

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate || function () { };

        this.Init(options || { color: 0x222222 });
    }

    Button.prototype = {

        element: null,
        mouseX: 0, mouseY: 0,
        windowHalfX: window.innerWidth / 2,
        windowHalfY: window.innerHeight / 2,
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

        Init: function (options) {
            var self = this;

            this.element = document.getElementById(options.id);
            
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
            event.stopPropagation && event.stopPropagation();
            event.cancelBubble = true;
            event.returnValue = false;
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
            //navigator.vibrate(10);
            this.mouseDown = false;
            this.events.trigger('up', true);
        }
    };

    FYO.Button = Button;
})();
var FYO = FYO || {};

(function () {
    'use strict';

    function Button2D(connector, options) {
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

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate || function () { };

        this.Init(options || { color: 0x222222 });
    }

    Button2D.prototype = {

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

            
            this.image = document.createElement('div');
            var style = 'background: url(\'' + (options.image || '/fyogametable/imgs/Red_A.png') + '\') no-repeat center center;';
            style += 'background-size: contain; width: 100%; height: 100%;'
            this.image.setAttribute('style', style);
            this.element.appendChild(this.image);

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
        }
    };

    FYO.Button2D = Button2D;
})();
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

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate || function () { };

        this.Init(options || { color: 0x222222 });
        //this.Animate();
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
                    self.Render();
                }, onProgress, onError);
            } else if(options.image) {

                var texture = new THREE.Texture();
                var loader = new THREE.ImageLoader(manager);
                loader.load(options.image || '/fyogametable/imgs/Red_A.png', function (image) {
                    texture.image = image;
                    texture.needsUpdate = true;
                    self.Render();
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
                    self.Render();
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
            this.Render();
        },

        onWindowResize: function () {
            this.elementHalfX = this.element.clientWidth / 2;
            this.elementHalfY = this.element.clientHeight / 2;
            this.camera.aspect = this.elementHalfX / this.elementHalfY;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
            this.Render();
        },
        onMouseMove: function (event) {
            event.preventDefault();
            this.mouseX = event.offsetX;
            this.mouseY = event.offsetY;
            this.Render();
        },
        onMouseDown: function (event) {
            event.preventDefault();
            this.mouseDown = true;
            this.events.trigger('down', true);
            this.Render();
        },
        onMouseUp: function (event) {
            event.preventDefault();
            this.mouseDown = false;
            this.events.trigger('up', true);
            this.Render();
        },
        onMouseLeave: function (event) {
            event.preventDefault();
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
            this.Render();
        },
        onTouchStart: function () {
            navigator.vibrate(10);
            this.mouseDown = true;
            this.events.trigger('down', true);
            this.Render();
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
            this.Render();
        },
        onTouchDone: function (event) {
            event.preventDefault();
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
            //navigator.vibrate(10);
            this.mouseDown = false;
            this.events.trigger('up', true);
            this.Render();
        },

        //Animate: function () {
        //    var self = this;
        //    requestAnimationFrame(function () {
        //        self.Animate();
        //    });
        //    this.Render();
        //},

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

    function DPad2D(connector, options) {
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

        this.events = new FYO.EventManager(100); // 10 per second

        if (options.onmoved) {
            this.events.on('moved', options.onmoved);
        }

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate || function () { };

        this.Init(options);
    }

    DPad2D.prototype = {

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
            style += 'padding: 30px;';

            this.element.setAttribute('style', style);
            this.onWindowResize();
        },

        Init: function (options) {
            var self = this;

            this.element = document.createElement('div');

            // TODO: (garrett) This needs to be abstracted out like the button
            if (options.side) {
                this.element.setAttribute('style', 'padding: 30px; position: absolute; top: 0; left: 50%; right: 0; bottom: 30%;');
            } else {
                this.element.setAttribute('style', 'padding: 30px; position: absolute; top: 0; left: 0; right: 50%; bottom: 0;');
            }

            var containerParent = document.body;
            if (options.container) {
                containerParent = document.getElementById(options.container);
            }
            containerParent.appendChild(this.element);


            this.elementHalfX = this.element.clientWidth / 2;
            this.elementHalfY = this.element.clientHeight / 2;

            this.image = document.createElement('div');
            var style = 'background: url(\'' + (options.image || '/fyogametable/assets/imgs/DPad_2D.png') + '\') no-repeat center center;';
            style += 'background-size: contain; width: 100%; height: 100%;'
            this.image.setAttribute('style', style);

            this.element.appendChild(this.image);
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
        onTouchStart: function (event) {
            event.preventDefault();
            navigator.vibrate(10);
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

            var prevX = this.x;
            var prevY = this.y;

            var _y = (this.mouseY - this.elementHalfY) / this.elementHalfY;
            var _x = (this.mouseX - this.elementHalfX) / this.elementHalfX;
            this.x = -Math.sin(_x);
            this.y = Math.sin(_y);
            var len = Math.sqrt((this.x * this.x + this.y * this.y));
            if (len > 1) {
                this.x /= len;
                this.y /= len;
            }



            if (Math.abs(this.y) > Math.abs(this.x)) {
                this.y = this.y > 0 ? 1 : -1;
                this.x = 0;
            } else if (Math.abs(this.x) > Math.abs(this.y)) {
                this.x = this.x > 0 ? 1 : -1;
                this.y = 0;
            } else {
                this.x = 0;
                this.y = 0;
            }

            if (prevX != this.x || prevY != this.y) {
                navigator.vibrate(10);
            }


            this.events.trigger('moved', {
                x: -this.x,
                y: -this.y
            });
        }
    };

    FYO.DPad2D = DPad2D;
})();
var FYO = FYO || {};

(function () {
    'use strict';

    function DPad3D(connector, options) {
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

        this.events = new FYO.EventManager(100); // 10 per second

        if (options.onmoved) {
            this.events.on('moved', options.onmoved);
        }

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate || function () { };

        this.Init(options);
    }

    DPad3D.prototype = {

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
            this.camera.position.y = 7;
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
            loader.load('/fyogametable/assets/objs/DPad.obj', function (object) {
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
                self.Render();
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
            this.Render();
        },

        onWindowResize: function () {
            this.elementHalfX = this.element.clientWidth / 2;
            this.elementHalfY = this.element.clientHeight / 2;
            this.camera.aspect = this.elementHalfX / this.elementHalfY;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
            this.Render();
        },
        onMouseMove: function (event) {
            event.preventDefault();
            this.mouseX = event.offsetX;
            this.mouseY = event.offsetY;
            this._update();
            this.Render();
        },
        onMouseLeave: function (event) {
            event.preventDefault();
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
            this._update();
            this.Render();
        },
        onTouchStart: function (event) {
            event.preventDefault();
            navigator.vibrate(10);
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
            this.Render();
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
            this.Render();
        },
        onTouchDone: function (event) {
            event.preventDefault();
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
            this._update();
            navigator.vibrate(10);
            this.Render();
        },

        _update: function () {

            var prevX = this.x;
            var prevY = this.y;

            var _y = (this.mouseY - this.elementHalfY) / this.elementHalfY;
            var _x = (this.mouseX - this.elementHalfX) / this.elementHalfX;
            this.x = -Math.sin(_x);
            this.y = Math.sin(_y);
            var len = Math.sqrt((this.x * this.x + this.y * this.y));
            if (len > 1) {
                this.x /= len;
                this.y /= len;
            }



            if (Math.abs(this.y) > Math.abs(this.x)) {
                this.y = this.y > 0 ? 1 : -1;
                this.x = 0;
            } else if (Math.abs(this.x) > Math.abs(this.y)) {
                this.x = this.x > 0 ? 1 : -1;
                this.y = 0;
            } else {
                this.x = 0;
                this.y = 0;
            }

            if (prevX != this.x || prevY != this.y) {
                navigator.vibrate(10);
            }


            this.events.trigger('moved', {
                x: -this.x,
                y: -this.y
            });
        },

        Render: function () {

            if (this.thumbObj !== null) {
                this.thumbObj.rotation.x = this.y / 4.0;
                this.thumbObj.rotation.z = this.x / 4.0;
            }

            this.renderer.render(this.scene, this.camera);
        }
    };

    FYO.DPad3D = DPad3D;
})();
var FYO = FYO || {};

(function () {
    'use strict';

    function EventManager(rateLimit) {
        this.rateLimit = rateLimit || 0;
        this.lastSent = +new Date;
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

            var t = +new Date;
            var dt = t - this.lastSent;
            if (dt < this.rateLimit) {
                return;
            }
            this.lastSent = t;

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
            self.OnConnect();
            this.socket.emit('fyo-client');
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

    IOHelper.GetDevices = function (cb) {
        if (navigator.mediaDevices) {
            navigator.mediaDevices.enumerateDevices().then(function (devices) {
                var result = {
                    audioInput: [],
                    audioOutput: [],
                    videoInput: []
                };

                for (var i = 0; i < devices.length; i++) {
                    switch (devices[i].kind) {
                        case 'audioinput':
                            result.audioInput.push({
                                deviceId: devices[i].deviceId,
                                groupId: devices[i].groupId,
                                label: devices[i].label
                            });
                            break;
                        case 'videoinput':
                            result.videoInput.push({
                                deviceId: devices[i].deviceId,
                                groupId: devices[i].groupId,
                                label: devices[i].label
                            });
                            break;
                        case 'audiooutput':
                            result.audioOutput.push({
                                deviceId: devices[i].deviceId,
                                groupId: devices[i].groupId,
                                label: devices[i].label
                            });
                            break;
                        default:
                            break;
                    }
                }

                cb && cb(result);
            });
        } else {
            cb && cb(null);
        }
    };

    IOHelper.prototype = {
        _getBattery: function (cb) {
            if (navigator.getBattery) {
                navigator.getBattery().then(function (battery) {
                    if (battery) {
                        cb && cb({
                            charging: battery.charging,
                            chargingTime: battery.chargingTime,
                            dischargingTime: battery.dischargingTime,
                            level: battery.level
                        });
                    } else {
                        cb && cb(null);
                    }
                });
            } else {
                cb && cb(null);
            }
        },

        GetDeviceInfo: function (cb) {
            var self = this;

            var result = {
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
                },
                orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
            };

            result.capabilities = {
                deviceorientation: Modernizr.deviceorientation,
                devicemotion: Modernizr.devicemotion,
                ambientlight: Modernizr.ambientlight,
                applicationcache: Modernizr.applicationcache,
                audiopreload: Modernizr.audiopreload,
                batteryapi: Modernizr.batteryapi,
                canvas: Modernizr.canvas,
                cors: Modernizr.cors,
                cssanimations: Modernizr.cssanimations,
                emoji: Modernizr.emoji,
                forcetouch: Modernizr.forcetouch,
                fullscreen: Modernizr.fullscreen,
                gamepads: Modernizr.gamepads,
                geolocation: Modernizr.geolocation,
                getusermedia: Modernizr.getusermedia,
                localstorage: Modernizr.localstorage,
                lowbattery: Modernizr.lowbattery,
                notification: Modernizr.notification,
                pointerlock: Modernizr.pointerlock,
                proximity: Modernizr.proximity,
                requestanimationframe: Modernizr.requestanimationframe,
                sessionstorage: Modernizr.sessionstorage,
                speechrecognition: Modernizr.speechrecognition,
                speechsynthesis: Modernizr.speechsynthesis,
                svg: Modernizr.svg,
                touchevents: Modernizr.touchevents,
                vibrate: Modernizr.vibrate,
                webanimations: Modernizr.webanimations,
                webaudio: Modernizr.webaudio,
                webgl: Modernizr.webgl,
                websockets: Modernizr.websockets,
                webworkers: Modernizr.webworkers,
                video: Modernizr.video == true,
                audio: Modernizr.audio == true
            };

            cb && cb(result);
            // this._getBattery(function (battery) {

            //     result.isDesktop = !battery || (battery.charging && battery.chargingTime == 0);

            //     if (battery) {
            //         result.battery = {
            //             charging: battery.charging,
            //             chargingTime: battery.chargingTime,
            //             dischargingTime: battery.dischargingTime,
            //             level: battery.level
            //         };
            //     }

            //     IOHelper.GetDevices(function (devices) {
            //         result.devices = devices;

            //         cb && cb(result);
            //     });

            // });
        }
    };

    FYO.IOHelper = IOHelper;
})();
/*! modernizr 3.5.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-MessageChannel-ambientlight-animation-applicationcache-atobbtoa-audio-audiopreload-batteryapi-blobconstructor-canvas-canvastext-contenteditable-contextmenu-cookies-cors-cssanimations-devicemotion_deviceorientation-emoji-eventlistener-filereader-filesystem-fontface-forcetouch-fullscreen-gamepads-geolocation-getusermedia-indexeddb-json-localstorage-lowbattery-notification-pointerlock-proximity-requestanimationframe-sessionstorage-speechrecognition-speechsynthesis-svg-touchevents-vibrate-video-videoautoplay-webaudio-webgl-webglextensions-webintents-websockets-websqldatabase-webworkers-setclasses !*/
!function(A,e,t){function a(A,e){return typeof A===e}function n(){var A,e,t,n,w,o,i;for(var D in C)if(C.hasOwnProperty(D)){if(A=[],e=C[D],e.name&&(A.push(e.name.toLowerCase()),e.options&&e.options.aliases&&e.options.aliases.length))for(t=0;t<e.options.aliases.length;t++)A.push(e.options.aliases[t].toLowerCase());for(n=a(e.fn,"function")?e.fn():e.fn,w=0;w<A.length;w++)o=A[w],i=o.split("."),1===i.length?Modernizr[i[0]]=n:(!Modernizr[i[0]]||Modernizr[i[0]]instanceof Boolean||(Modernizr[i[0]]=new Boolean(Modernizr[i[0]])),Modernizr[i[0]][i[1]]=n),f.push((n?"":"no-")+i.join("-"))}}function w(A){var e=R.className,t=Modernizr._config.classPrefix||"";if(V&&(e=e.baseVal),Modernizr._config.enableJSClass){var a=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");e=e.replace(a,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(e+=" "+t+A.join(" "+t),V?R.className.baseVal=e:R.className=e)}function o(){return"function"!=typeof e.createElement?e.createElement(arguments[0]):V?e.createElementNS.call(e,"http://www.w3.org/2000/svg",arguments[0]):e.createElement.apply(e,arguments)}function i(A){return A.replace(/([a-z])-([a-z])/g,function(A,e,t){return e+t.toUpperCase()}).replace(/^-/,"")}function D(A,e){if("object"==typeof A)for(var t in A)M(A,t)&&D(t,A[t]);else{A=A.toLowerCase();var a=A.split("."),n=Modernizr[a[0]];if(2==a.length&&(n=n[a[1]]),"undefined"!=typeof n)return Modernizr;e="function"==typeof e?e():e,1==a.length?Modernizr[a[0]]=e:(!Modernizr[a[0]]||Modernizr[a[0]]instanceof Boolean||(Modernizr[a[0]]=new Boolean(Modernizr[a[0]])),Modernizr[a[0]][a[1]]=e),w([(e&&0!=e?"":"no-")+a.join("-")]),Modernizr._trigger(A,e)}return Modernizr}function r(){var A=e.body;return A||(A=o(V?"svg":"body"),A.fake=!0),A}function P(A,t,a,n){var w,i,D,P,d="modernizr",s=o("div"),l=r();if(parseInt(a,10))for(;a--;)D=o("div"),D.id=n?n[a]:d+(a+1),s.appendChild(D);return w=o("style"),w.type="text/css",w.id="s"+d,(l.fake?l:s).appendChild(w),l.appendChild(s),w.styleSheet?w.styleSheet.cssText=A:w.appendChild(e.createTextNode(A)),s.id=d,l.fake&&(l.style.background="",l.style.overflow="hidden",P=R.style.overflow,R.style.overflow="hidden",R.appendChild(l)),i=t(s,A),l.fake?(l.parentNode.removeChild(l),R.style.overflow=P,R.offsetHeight):s.parentNode.removeChild(s),!!i}function d(A,e){return!!~(""+A).indexOf(e)}function s(A,e){return function(){return A.apply(e,arguments)}}function l(A,e,t){var n;for(var w in A)if(A[w]in e)return t===!1?A[w]:(n=e[A[w]],a(n,"function")?s(n,t||e):n);return!1}function E(A){return A.replace(/([A-Z])/g,function(A,e){return"-"+e.toLowerCase()}).replace(/^ms-/,"-ms-")}function B(e,t,a){var n;if("getComputedStyle"in A){n=getComputedStyle.call(A,e,t);var w=A.console;if(null!==n)a&&(n=n.getPropertyValue(a));else if(w){var o=w.error?"error":"log";w[o].call(w,"getComputedStyle returning null, its possible modernizr test results are inaccurate")}}else n=!t&&e.currentStyle&&e.currentStyle[a];return n}function c(e,a){var n=e.length;if("CSS"in A&&"supports"in A.CSS){for(;n--;)if(A.CSS.supports(E(e[n]),a))return!0;return!1}if("CSSSupportsRule"in A){for(var w=[];n--;)w.push("("+E(e[n])+":"+a+")");return w=w.join(" or "),P("@supports ("+w+") { #modernizr { position: absolute; } }",function(A){return"absolute"==B(A,null,"position")})}return t}function Q(A,e,n,w){function D(){P&&(delete x.style,delete x.modElem)}if(w=a(w,"undefined")?!1:w,!a(n,"undefined")){var r=c(A,n);if(!a(r,"undefined"))return r}for(var P,s,l,E,B,Q=["modernizr","tspan","samp"];!x.style&&Q.length;)P=!0,x.modElem=o(Q.shift()),x.style=x.modElem.style;for(l=A.length,s=0;l>s;s++)if(E=A[s],B=x.style[E],d(E,"-")&&(E=i(E)),x.style[E]!==t){if(w||a(n,"undefined"))return D(),"pfx"==e?E:!0;try{x.style[E]=n}catch(u){}if(x.style[E]!=B)return D(),"pfx"==e?E:!0}return D(),!1}function u(A,e,t,n,w){var o=A.charAt(0).toUpperCase()+A.slice(1),i=(A+" "+F.join(o+" ")+o).split(" ");return a(e,"string")||a(e,"undefined")?Q(i,e,n,w):(i=(A+" "+b.join(o+" ")+o).split(" "),l(i,e,t))}function g(A,e){var t=A.deleteDatabase(e);t.onsuccess=function(){D("indexeddb.deletedatabase",!0)},t.onerror=function(){D("indexeddb.deletedatabase",!1)}}function v(A,e,a){return u(A,t,t,e,a)}var f=[],C=[],p={_version:"3.5.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(A,e){var t=this;setTimeout(function(){e(t[A])},0)},addTest:function(A,e,t){C.push({name:A,fn:e,options:t})},addAsyncTest:function(A){C.push({name:null,fn:A})}},Modernizr=function(){};Modernizr.prototype=p,Modernizr=new Modernizr,Modernizr.addTest("applicationcache","applicationCache"in A),Modernizr.addTest("blobconstructor",function(){try{return!!new Blob}catch(A){return!1}},{aliases:["blob-constructor"]}),Modernizr.addTest("cors","XMLHttpRequest"in A&&"withCredentials"in new XMLHttpRequest),Modernizr.addTest("eventlistener","addEventListener"in A),Modernizr.addTest("geolocation","geolocation"in navigator),Modernizr.addTest("json","JSON"in A&&"parse"in JSON&&"stringify"in JSON),Modernizr.addTest("messagechannel","MessageChannel"in A),Modernizr.addTest("notification",function(){if(!A.Notification||!A.Notification.requestPermission)return!1;if("granted"===A.Notification.permission)return!0;try{new A.Notification("")}catch(e){if("TypeError"===e.name)return!1}return!0}),Modernizr.addTest("svg",!!e.createElementNS&&!!e.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect),Modernizr.addTest("cookies",function(){try{e.cookie="cookietest=1";var A=-1!=e.cookie.indexOf("cookietest=");return e.cookie="cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT",A}catch(t){return!1}});var m=!1;try{m="WebSocket"in A&&2===A.WebSocket.CLOSING}catch(I){}Modernizr.addTest("websockets",m),Modernizr.addTest("webaudio",function(){var e="webkitAudioContext"in A,t="AudioContext"in A;return Modernizr._config.usePrefixes?e||t:t}),Modernizr.addTest("devicemotion","DeviceMotionEvent"in A),Modernizr.addTest("deviceorientation","DeviceOrientationEvent"in A),Modernizr.addTest("filereader",!!(A.File&&A.FileList&&A.FileReader)),Modernizr.addTest("speechsynthesis","SpeechSynthesisUtterance"in A),Modernizr.addTest("localstorage",function(){var A="modernizr";try{return localStorage.setItem(A,A),localStorage.removeItem(A),!0}catch(e){return!1}}),Modernizr.addTest("sessionstorage",function(){var A="modernizr";try{return sessionStorage.setItem(A,A),sessionStorage.removeItem(A),!0}catch(e){return!1}}),Modernizr.addTest("websqldatabase","openDatabase"in A),Modernizr.addTest("atobbtoa","atob"in A&&"btoa"in A,{aliases:["atob-btoa"]}),Modernizr.addTest("webworkers","Worker"in A);var R=e.documentElement;Modernizr.addTest("contextmenu","contextMenu"in R&&"HTMLMenuItemElement"in A);var V="svg"===R.nodeName.toLowerCase();Modernizr.addTest("audio",function(){var A=o("audio"),e=!1;try{e=!!A.canPlayType,e&&(e=new Boolean(e),e.ogg=A.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),e.mp3=A.canPlayType('audio/mpeg; codecs="mp3"').replace(/^no$/,""),e.opus=A.canPlayType('audio/ogg; codecs="opus"')||A.canPlayType('audio/webm; codecs="opus"').replace(/^no$/,""),e.wav=A.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),e.m4a=(A.canPlayType("audio/x-m4a;")||A.canPlayType("audio/aac;")).replace(/^no$/,""))}catch(t){}return e}),Modernizr.addTest("canvas",function(){var A=o("canvas");return!(!A.getContext||!A.getContext("2d"))}),Modernizr.addTest("canvastext",function(){return Modernizr.canvas===!1?!1:"function"==typeof o("canvas").getContext("2d").fillText}),Modernizr.addTest("contenteditable",function(){if("contentEditable"in R){var A=o("div");return A.contentEditable=!0,"true"===A.contentEditable}}),Modernizr.addTest("emoji",function(){if(!Modernizr.canvastext)return!1;var e=A.devicePixelRatio||1,t=12*e,a=o("canvas"),n=a.getContext("2d");return n.fillStyle="#f00",n.textBaseline="top",n.font="32px Arial",n.fillText("🐨",0,0),0!==n.getImageData(t,t,1,1).data[0]}),Modernizr.addTest("video",function(){var A=o("video"),e=!1;try{e=!!A.canPlayType,e&&(e=new Boolean(e),e.ogg=A.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),e.h264=A.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),e.webm=A.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,""),e.vp9=A.canPlayType('video/webm; codecs="vp9"').replace(/^no$/,""),e.hls=A.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/,""))}catch(t){}return e}),Modernizr.addTest("webanimations","animate"in o("div")),Modernizr.addTest("webgl",function(){var e=o("canvas"),t="probablySupportsContext"in e?"probablySupportsContext":"supportsContext";return t in e?e[t]("webgl")||e[t]("experimental-webgl"):"WebGLRenderingContext"in A}),Modernizr.addAsyncTest(function(){if(Modernizr.webglextensions=!1,Modernizr.webgl){var A,e,a;try{A=o("canvas"),e=A.getContext("webgl")||A.getContext("experimental-webgl"),a=e.getSupportedExtensions()}catch(n){return}e!==t&&(Modernizr.webglextensions=new Boolean(!0));for(var w=-1,i=a.length;++w<i;)Modernizr.webglextensions[a[w]]=!0;A=t}});var y=function(){function A(A,e){var n;return A?(e&&"string"!=typeof e||(e=o(e||"div")),A="on"+A,n=A in e,!n&&a&&(e.setAttribute||(e=o("div")),e.setAttribute(A,""),n="function"==typeof e[A],e[A]!==t&&(e[A]=t),e.removeAttribute(A)),n):!1}var a=!("onblur"in e.documentElement);return A}();p.hasEvent=y,Modernizr.addTest("ambientlight",y("devicelight",A));var h=p._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):["",""];p._prefixes=h;var M;!function(){var A={}.hasOwnProperty;M=a(A,"undefined")||a(A.call,"undefined")?function(A,e){return e in A&&a(A.constructor.prototype[e],"undefined")}:function(e,t){return A.call(e,t)}}(),p._l={},p.on=function(A,e){this._l[A]||(this._l[A]=[]),this._l[A].push(e),Modernizr.hasOwnProperty(A)&&setTimeout(function(){Modernizr._trigger(A,Modernizr[A])},0)},p._trigger=function(A,e){if(this._l[A]){var t=this._l[A];setTimeout(function(){var A,a;for(A=0;A<t.length;A++)(a=t[A])(e)},0),delete this._l[A]}},Modernizr._q.push(function(){p.addTest=D}),Modernizr.addAsyncTest(function(){function e(){clearTimeout(t),A.removeEventListener("deviceproximity",e),D("proximity",!0)}var t,a=300;"ondeviceproximity"in A&&"onuserproximity"in A?(A.addEventListener("deviceproximity",e),t=setTimeout(function(){A.removeEventListener("deviceproximity",e),D("proximity",!1)},a)):D("proximity",!1)}),Modernizr.addAsyncTest(function(){function A(a){clearTimeout(e);var w=a!==t&&"loadeddata"===a.type?!0:!1;n.removeEventListener("loadeddata",A,!1),D("audiopreload",w),n.parentNode.removeChild(n)}var e,a=300,n=o("audio"),w=n.style;if(!(Modernizr.audio&&"preload"in n))return void D("audiopreload",!1);w.position="absolute",w.height=0,w.width=0;try{if(Modernizr.audio.mp3)n.src="data:audio/mpeg;base64,//MUxAAB6AXgAAAAAPP+c6nf//yi/6f3//MUxAMAAAIAAAjEcH//0fTX6C9Lf//0//MUxA4BeAIAAAAAAKX2/6zv//+IlR4f//MUxBMCMAH8AAAAABYWalVMQU1FMy45//MUxBUB0AH0AAAAADkuM1VVVVVVVVVV//MUxBgBUATowAAAAFVVVVVVVVVVVVVV";else if(Modernizr.audio.m4a)n.src="data:audio/x-m4a;base64,AAAAGGZ0eXBNNEEgAAACAGlzb21pc28yAAAACGZyZWUAAAAfbWRhdN4EAABsaWJmYWFjIDEuMjgAAAFoAQBHAAACiG1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAYAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAG0dHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAYAAAAAAAAAAAAAAAAAQAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAABUG1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAArEQAAAQAVcQAAAAAAC1oZGxyAAAAAAAAAABzb3VuAAAAAAAAAAAAAAAAU291bmRIYW5kbGVyAAAAAPttaW5mAAAAEHNtaGQAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAL9zdGJsAAAAW3N0c2QAAAAAAAAAAQAAAEttcDRhAAAAAAAAAAEAAAAAAAAAAAACABAAAAAArEQAAAAAACdlc2RzAAAAAAMZAAEABBFAFQAAAAABftAAAAAABQISCAYBAgAAABhzdHRzAAAAAAAAAAEAAAABAAAEAAAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAAUc3RzegAAAAAAAAAXAAAAAQAAABRzdGNvAAAAAAAAAAEAAAAoAAAAYHVkdGEAAABYbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAraWxzdAAAACOpdG9vAAAAG2RhdGEAAAABAAAAAExhdmY1Mi42NC4y";else if(Modernizr.audio.ogg)n.src="data:audio/ogg;base64,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lFJKKaWUUkoppZRSSimllFJKKaWUUkqppJRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoplVJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSCgCQinAAkHowoQwUGrISAEgFAACMUUopxpyDEDHmGGPQSSgpYsw5xhyUklLlHIQQUmktt8o5CCGk1FJtmXNSWosx5hgz56SkFFvNOYdSUoux5ppr7qS0VmuuNedaWqs115xzzbm0FmuuOdecc8sx15xzzjnnGHPOOeecc84FAOA0OACAHtiwOsJJ0VhgoSErAYBUAAACGaUYc8456BBSjDnnHIQQIoUYc845CCFUjDnnHHQQQqgYc8w5CCGEkDnnHIQQQgghcw466CCEEEIHHYQQQgihlM5BCCGEEEooIYQQQgghhBA6CCGEEEIIIYQQQgghhFJKCCGEEEIJoZRQAABggQMAQIANqyOcFI0FFhqyEgAAAgCAHJagUs6EQY5Bjw1BylEzDUJMOdGZYk5qMxVTkDkQnXQSGWpB2V4yCwAAgCAAIMAEEBggKPhCCIgxAABBiMwQCYVVsMCgDBoc5gHAA0SERACQmKBIu7iALgNc0MVdB0IIQhCCWBxAAQk4OOGGJ97whBucoFNU6iAAAAAAAAwA4AEA4KAAIiKaq7C4wMjQ2ODo8AgAAAAAABYA+AAAOD6AiIjmKiwuMDI0Njg6PAIAAAAAAAAAAICAgAAAAAAAQAAAAICAT2dnUwAE7AwAAAAAAAD/QwAAAgAAADuydfsFAQEBAQEACg4ODg==";else{if(!Modernizr.audio.wav)return void D("audiopreload",!1);n.src="data:audio/wav;base64,UklGRvwZAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdgZAAAAAAEA/v8CAP//AAABAP////8DAPz/BAD9/wEAAAAAAAAAAAABAP7/AgD//wAAAQD//wAAAQD//wAAAQD+/wIA//8AAAAAAAD//wIA/v8BAAAA//8BAAAA//8BAP//AQAAAP//AQD//wEAAAD//wEA//8BAP//AQD//wEA//8BAP//AQD+/wMA/f8DAP3/AgD+/wIA/////wMA/f8CAP7/AgD+/wMA/f8CAP7/AgD//wAAAAAAAAAAAQD+/wIA/v8CAP7/AwD9/wIA/v8BAAEA/v8CAP7/AQAAAAAAAAD//wEAAAD//wIA/f8DAP7/AQD//wEAAAD//wEA//8CAP7/AQD//wIA/v8CAP7/AQAAAAAAAAD//wEAAAAAAAAA//8BAP//AgD9/wQA+/8FAPz/AgAAAP//AgD+/wEAAAD//wIA/v8CAP3/BAD8/wQA/P8DAP7/AwD8/wQA/P8DAP7/AQAAAAAA//8BAP//AgD+/wEAAAD//wIA/v8BAP//AQD//wEAAAD//wEA//8BAAAAAAAAAP//AgD+/wEAAAAAAAAAAAD//wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AgD+/wIA/v8BAP//AQABAP7/AQD//wIA/v8CAP3/AwD/////AgD9/wMA/v8BAP//AQAAAP//AQD//wEA//8BAP//AAABAP//AAABAP//AQD//wAAAAACAP3/AwD9/wIA//8BAP//AQD//wEA//8BAP//AgD9/wMA/v8AAAIA/f8CAAAA/v8EAPv/BAD9/wIAAAD+/wQA+v8HAPr/BAD+/wEAAAD//wIA/f8EAPz/BAD7/wUA/P8EAPz/AwD+/wEAAAD//wEAAAAAAP//AgD8/wUA+/8FAPz/AwD9/wIA//8AAAEA/v8CAP//AQD//wAAAAABAP//AgD9/wMA/f8EAPz/AwD+/wAAAwD7/wUA/P8DAP7/AQAAAP//AgD+/wEAAQD+/wIA/v8BAAEA/v8CAP7/AQAAAP//AgD9/wMA/f8DAP7/AgD+/wEAAAAAAAEA//8AAAEA/v8DAP3/AgD//wEA//8BAP7/AwD9/wMA/v8BAP//AQAAAP//AgD9/wMA/v8BAP//AQAAAP//AgD+/wEAAQD+/wIA/////wIA//8AAAEA/f8DAP//AAABAP////8DAP3/AwD+/wEA//8BAP//AQAAAAAA//8BAP//AQD//wEA//8BAP//AAAAAAEA//8BAP7/AgD//wEA//8AAAAAAAAAAAAAAAD//wIA/v8BAAAA//8BAAEA/v8BAAAA//8DAPz/AwD+/wIA/v8CAP3/AwD+/wEAAAD//wEA//8BAAAA//8BAAAA/v8EAPv/BAD+/wAAAAABAP7/AgD//wAAAAABAP7/AgD//wAAAAAAAAAAAAABAP3/BAD8/wQA/f8BAAAAAAABAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8BAAAAAAD//wIA/f8DAP7/AAABAP//AAACAPz/BAD9/wIA//8AAP//AwD9/wMA/P8EAP3/AwD9/wIA//8BAP//AQD+/wMA/f8DAP7/AAABAP//AQAAAP//AQD//wIA/f8DAP7/AQAAAP//AQAAAAAA//8CAP7/AQABAP7/AgD+/wEAAQD+/wIA/v8CAP////8CAP7/AgD//wAAAAABAP7/AwD9/wIAAAD+/wMA/f8CAP//AQD+/wMA/f8CAP//AAACAPz/BQD6/wUA/v///wIA/v8CAP3/BAD7/wYA+v8FAPz/AwD/////AgD+/wEAAAD//wEAAAD//wIA/f8DAP7/AQAAAP//AgD//wAA//8BAAAAAAAAAP//AQD//wEA//8AAAIA/f8DAP3/AgAAAP//AQD//wEA//8AAAEA//8BAP////8CAP//AAABAP3/BAD9/wIA/v8BAAEA//8BAP7/AgD//wEA//8AAAEA//8BAP//AAAAAAEA//8BAP7/AgD//wEA//8AAAAAAQD+/wIA/v8BAAAAAAD//wIA/v8BAAAAAAAAAAAAAQD+/wMA/f8CAP//AQD//wIA/f8DAP7/AQD//wEA//8CAP7/AAABAP7/AwD9/wMA/v8AAAEA//8BAAAAAAD//wIA/v8BAAAA//8CAP7/AgD+/wEA//8CAP7/AgD//wAAAAAAAAAAAQD//wEA/v8DAPz/BQD8/wIA//8AAAEAAAD//wEA//8BAP//AQAAAAAA//8BAP//AgD+/wEAAAAAAP//AQD+/wMA/////wEA/v8CAP//AQD//wEA//8AAAEA//8BAAAA/v8EAPz/AwD+/wEAAAAAAAAA//8CAP7/AQD//wEA//8BAP//AAABAP7/AwD9/wIA//8BAP//AQD//wEA//8AAAEA/v8EAPv/BAD9/wIA//8BAP7/AwD9/wIA//8AAAEA//8BAP//AQD//wAAAQD//wEAAAD+/wMA/v8AAAIA/f8DAP7/AQD//wAAAQD+/wMA/f8CAP//AAABAP7/AgD+/wMA/f8CAP7/AQABAP7/AgD+/wIA/v8CAP7/AwD8/wMA//8AAAEA//8AAAAAAAABAP//AQD//wAAAQD//wIA/f8DAP3/AwD+/wAAAgD9/wIA//8AAAEAAAD+/wMA/P8FAPv/BAD9/wIA//8AAP//AgD+/wIA/v8BAAAAAAD//wEAAAAAAP//AQD//wEA//8BAP//AAABAP7/AwD9/wIA//8BAP//AAABAP//AQD//wAAAQD//wEA//8BAP//AAABAAAA//8BAP7/AwD9/wMA/f8DAP3/AgD//wEA//8BAP7/AgD//wAAAgD8/wQA/f8CAP//AQD+/wMA/f8CAP7/AgD//wAAAAAAAAAAAAABAP7/AwD9/wIA/v8DAP3/AwD9/wIA/v8DAPz/BQD7/wQA/f8CAP7/AwD9/wMA/f8CAP//AQAAAP7/AwD+/wEA//8AAAEAAAAAAP//AAABAP//AQAAAP7/AwD9/wMA/f8CAP//AQD//wEA//8AAAIA/f8CAAAA//8BAAAA//8BAAAA/v8EAPv/BAD9/wIA//8AAAEA/v8CAP//AAABAP//AAABAP//AAABAP7/AwD8/wQA/f8CAAAA/v8DAP3/AwD9/wMA/v8BAAAA//8BAAAA//8CAP7/AQAAAAAAAAAAAAAA//8CAP7/AgD+/wIA/v8CAP7/AgD//wAAAQD//wAAAQD//wAAAQD//wAAAQD+/wIA//8AAAAAAQD+/wMA/f8CAP//AQD//wEA//8AAAEA/v8DAP3/AgD//wAAAAABAP7/AwD9/wIA//8AAAEA/v8DAP3/AgD//wAAAAABAP7/AwD8/wMA/v8CAP//AAD//wIA/v8CAP7/AQABAP7/AQAAAP//AgD/////AQD//wEAAAD//wEA/v8EAPv/BAD9/wMA/v8BAAAA//8BAAEA/P8GAPr/BQD8/wMA/v8BAAAA//8CAP7/AQABAP3/BAD7/wYA+/8EAPz/AwD//wEA//8BAP7/BAD8/wMA/v8AAAIA/v8BAAAA//8BAAAA//8BAAAA//8CAP3/AwD+/wAAAgD8/wUA/P8DAP7/AAABAAAAAAD//wEAAAD//wIA/f8DAP7/AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAEA/f8EAPz/AwD/////AgD+/wIA/f8DAP7/AgD+/wEA//8CAP7/AQD//wEAAAAAAP//AQAAAP//AgD9/wMA/v8BAAAA//8BAP//AQAAAP//AAACAP3/BAD7/wQA/v8BAAAA//8BAP//AQAAAP//AQAAAP7/BAD7/wUA+/8EAP3/AgD//wAAAQD+/wIA//8AAAEA/v8CAP//AQD+/wEAAAAAAAAAAAD//wEA//8CAP3/AwD9/wIA//8AAAAAAAAAAAAA//8BAP//AgD+/wEA//8CAP7/AQAAAP//AgD/////AgD/////AgD+/wIA//8AAP//AQABAP7/AgD9/wMA/v8CAP////8BAAAAAAAAAAAA//8CAP////8DAPz/AwD+/wEAAAAAAP//AQD//wEAAAD//wEAAAD+/wQA+/8FAPz/AgAAAP//AgD9/wMA/v8BAAAAAAD//wEAAAD//wIA/v8BAAAAAAD//wIA/v8BAAAA//8BAAAA//8CAP7/AQD//wEA//8BAAAA//8BAP//AAABAP//AQAAAP7/AgD//wEA//8AAAAAAQD+/wMA/P8EAP7///8DAPz/BQD8/wEAAQD+/wMA/v8AAAEA//8BAP//AQD//wEA/v8CAP//AQD//wAAAAABAAAA//8BAP//AQAAAAAA//8BAP//AgD+/wAAAQD//wIA/f8CAP//AQAAAP7/AwD9/wMA/v8BAP//AAABAP//AgD9/wIA//8BAAAA//8BAAAA//8CAP3/AwD+/wEAAAD+/wQA/P8DAP7/AAACAP7/AQAAAP//AQAAAP//AQAAAP//AgD9/wIAAAD//wIA/f8DAP7/AQD//wEA//8CAP7/AQD//wAAAQD//wEA//8AAAAAAQD//wEAAAD9/wUA+/8FAPz/AgD//wAAAQD//wAAAQD+/wMA/f8BAAEA/v8CAP7/AgD+/wIA/v8BAAAAAAAAAAAAAAD//wIA/v8CAP////8CAP7/AgD+/wIA/v8CAP7/AQAAAP//AQAAAP//AQD//wAAAQD//wAAAQD+/wMA/f8CAAAA/v8DAP3/AgAAAP//AQAAAP7/AwD9/wMA/v8BAP//AQD//wEAAAD+/wMA/f8CAAAA/v8CAP//AAAAAAEA//8AAAEA/v8DAP3/AwD9/wIA//8BAP//AgD8/wQA/v8BAAAA/v8CAP//AQD//wAAAAAAAAEA/f8EAPz/BAD9/wIA//8AAAAAAAABAP//AAAAAAAAAAABAP3/BAD9/wIA/v8BAAEA//8AAAAA//8CAP7/AgD9/wQA+/8FAPv/BQD8/wMA/f8DAP3/AwD+/wAAAgD9/wMA/f8CAAAA/v8EAPv/BQD7/wUA/P8DAP///v8DAP3/BAD8/wMA/f8DAP7/AQD//wEAAAD//wEA/v8CAAAA/v8CAP7/AgD//wAAAAAAAAAAAQD+/wIA//8AAAEA/v8DAPz/BAD9/wIA//8AAP//AgD//wEA/v8BAAAAAQD//wAAAAAAAAEA//8AAAEA//8BAP//AAABAP//AQD+/wIA/v8DAPz/BAD8/wQA/f8BAAAAAQD+/wMA/P8DAP//AAAAAAAAAAD//wMA+/8FAP3/AQABAP3/BAD8/wMA/v8BAAAA//8CAP3/AwD+/wEAAQD9/wMA/f8EAPz/BAD7/wQA/v8BAAEA/f8DAP7/AQAAAP//AgD+/wEAAAD//wIA/v8CAP7/AgD+/wEAAQD//wEA/v8CAP7/BAD7/wQA/f8CAAAA//8AAAAAAAABAP//AQD+/wEAAQD+/wMA/f8BAAEA/v8DAPz/AwD/////AwD8/wQA/P8DAP7/AgD//wAA//8BAAAAAAAAAP//AgD+/wEAAAD//wIA/v8BAAAA//8CAP3/AgD//wAAAQD+/wIA/v8BAAAA//8CAP7/AgD+/wEA//8CAP3/BAD7/wQA/v8BAAAA//8AAAEAAAD//wIA/f8DAP7/AgD+/wIA/v8CAP7/AgD+/wEAAAAAAP//AgD9/wMA/v8BAP//AgD9/wMA/v8AAAEA//8BAP//AQD//wEA//8AAAEA/v8EAPz/AgD//wAAAQAAAP//AAABAP//AQD//wEAAAD//wEA//8BAAEA/f8DAP7/AQABAP3/AwD+/wIA/////wEAAAAAAAAAAAD//wIA/v8CAP////8CAP7/AgD//wAA//8CAP3/BAD9/wAAAgD9/wMA/v8BAP//AQAAAP//AQAAAP//AgD9/wMA/f8EAPz/AwD+/wEAAAAAAAAAAAD//wIA/f8EAP3/AAABAAAA//8CAP7/AQAAAP//AQAAAAAA//8BAP//AQAAAP//AQAAAP//AQAAAP//AgD9/wMA/v8BAP//AQAAAP//AQD//wIA/v8CAP3/BAD9/wEAAAD//wEAAQD9/wMA/f8CAAAA/v8DAP3/AgD//wAAAQD+/wIA/v8CAP7/AQAAAP//AgD+/wEAAAAAAP//AwD7/wUA/f8BAAEA/v8BAAEA/v8DAP3/AgD//wEA//8BAP//AQD//wEA//8CAP3/BAD7/wQA/////wIA/v8AAAIA/v8CAP3/BAD7/wUA/P8DAP3/AwD9/wMA/v8AAAIA/v8CAP7/AgD+/wIA//8AAAEA/v8CAP7/AgD//wAAAAD//wEAAAAAAAAA//8BAP7/BAD7/wUA/P8CAAAA//8BAP//AQAAAP//AgD9/wMA/v8BAAAA//8BAAAA//8CAP3/AwD+/wEA//8CAP3/AwD+/wAAAwD8/wIAAAD//wIA/////wIA/v8CAP7/AgD+/wEAAAAAAAAAAAAAAP//AgD+/wIA//8AAAAA//8CAP7/AgD+/wEA//8CAP3/AwD9/wMA/v8BAP7/AwD9/wMA/f8CAP//AQD+/wIA//8BAP//AQD+/wMA/v8BAAAA//8BAAAA//8CAP7/AQAAAP//AgD+/wIA/v8CAP//AAAAAAEA//8BAP//AAABAAAA//8BAP//AQD//wEA//8BAP//AQAAAP//AQD//wEAAAD//wIA/f8CAAAA//8BAAAA//8BAP//AAABAP//AQD//wAAAAAAAAEA/v8CAP//AQD//wAAAAABAP7/AwD9/wIAAAD+/wIA//8BAP//AgD9/wMA/f8DAP7/AgD+/wEAAAAAAAEA/v8CAP7/AgD//wAAAAAAAAAAAAAAAP//AgD/////AgD9/wQA/f8BAAAAAAAAAAEA/f8DAP////8DAP3/AQABAP7/AgD//wAAAQD+/wMA/f8CAP7/AQABAP7/AwD7/wYA+v8FAP3/AQABAP7/AgD+/wMA/f8CAP7/AwD+/wEA//8BAP//AQAAAP7/BQD5/wcA+v8FAPz/AwD+/wIA/v8BAAAA//8DAPv/BQD8/wMA/////wEAAAAAAAAAAAD//wIA/f8DAP7/AQAAAP//AQAAAP//AgD+/wIA/v8BAAEA/f8EAPz/AwD+/wEA//8CAP7/AQD//wEA//8CAP7/AQAAAP//AgD+/wEAAAAAAAAAAAAAAAAAAAD//wIA/f8EAPz/AwD+/wEA//8CAP7/AgD+/wEAAQD+/wEAAQD+/wIA/////wIA//8AAAAAAAAAAAAAAAD//wEAAAAAAP//AgD9/wMA/v8BAP//AQAAAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQAAAP7/AwD9/wMA/v8BAP7/AwD9/wMA/v8BAP//AAABAP//AQD//wAAAAABAP//AAAAAAAAAQD//wEA/v8CAAAA/v8EAPv/BAD9/wIAAAD+/wMA/P8DAP//AAAAAP//AQD//wIA/f8DAP3/AwD9/wMA/v8BAAAA//8BAAAA//8CAP3/AwD9/wQA+/8FAPv/BQD8/wMA/v8BAAAA//8BAP//AgD+/wEAAAD//wIA/v8BAAEA/f8DAP3/AgAAAP//AQD//wAAAQD//wEA//8BAP//AQD//wEA/v8DAP3/AgAAAP7/AwD9/wIAAAD//wEAAAD//wIA/f8DAP7/AgD9/wQA+/8FAPz/AgAAAP//AgD9/wIA//8BAP//AQD//wEA//8BAP//AQD//wIA/f8DAP3/AgD//wAAAQD+/wIA/v8BAAEA/v8CAP7/AgD+/wMA/P8DAP//AAABAP7/AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEA/v8CAP3/BAD8/wMA/v8BAAAAAAD//wEAAAAAAAAAAAD//wEAAAAAAAAA//8BAP//AgD+/wEA//8CAP3/AwD9/wMA/f8EAPv/BAD+/wAAAQD//wEA//8BAP//AAABAP//AQD//wEAAAD//wEA//8BAP//AgD9/wMA/v8AAAIA/f8DAP7/AAACAP3/AwD+/wEA//8BAP//AQAAAP//AQAAAP7/AwD9/wMA/v8AAAEA//8BAP//AAAAAAEA//8AAAEA/v8CAP//AAAAAAEA/v8DAPz/BAD9/wEAAQD+/wEAAQD9/wQA/P8DAP7/AQAAAAAAAAAAAAAAAAAAAAAAAQD+/wIA/////wIA/v8BAAAA//8BAP//AQD//wEA//8BAAAA/v8EAPz/AwD///7/BAD8/wMA/////wIA/v8CAP////8CAP7/AgD+/wIA/v8CAP////8CAP7/AwD9/wIA/v8CAP//AAABAP7/AwD9/wEAAQD+/wMA/f8CAP//AAAAAAEA/v8DAPz/BAD9/wIA/v8CAP7/AgD//wAAAAD//wIA/v8CAP7/AQAAAAAA//8CAP7/AgD+/wIA/v8CAP7/AwD8/wUA+v8GAPv/AwD//wAAAAAAAAAA//8DAPv/BQD9/wAAAgD9/wMA/v8BAP//AQAAAP//AgD9/wMA/v8BAAAA//8BAAAAAAAAAP//AQAAAAAAAAD//wEA//8CAP3/AwD+/wAAAgD+/wEAAAD//wIA/v8CAP7/AgD/////AwD8/wUA/P8CAP//AQD//wIA/f8DAP3/AwD+/wAAAQD+/wMA/f8DAP3/AgD//wAAAQD//wEA//8BAP7/AwD+/wEA//8AAAEA//8CAPz/BAD9/wIA//8AAAEA/v8DAPz/BAD9/wIA//8AAAEA/v8CAP7/AgD//wEA/f8EAPz/BAD+////AgD//wAAAQD//wAAAQD//wEA//8BAP7/AwD+/wEA"}}catch(i){return void D("audiopreload",!1)}n.setAttribute("preload","auto"),n.style.cssText="display:none",R.appendChild(n),setTimeout(function(){n.addEventListener("loadeddata",A,!1),e=setTimeout(A,a)},0)}),Modernizr.addAsyncTest(function(){function A(o){n++,clearTimeout(e);var i=o&&"playing"===o.type||0!==w.currentTime;return!i&&a>n?void(e=setTimeout(A,t)):(w.removeEventListener("playing",A,!1),D("videoautoplay",i),void(w.parentNode&&w.parentNode.removeChild(w)))}var e,t=200,a=5,n=0,w=o("video"),i=w.style;if(!(Modernizr.video&&"autoplay"in w))return void D("videoautoplay",!1);i.position="absolute",i.height=0,i.width=0;try{if(Modernizr.video.ogg)w.src="data:video/ogg;base64,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";else{if(!Modernizr.video.h264)return void D("videoautoplay",!1);w.src="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFkAAr/4QAYZ2QACqzZX4iIhAAAAwAEAAADAFA8SJZYAQAGaOvjyyLAAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAsUAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU2LjQwLjEwMQ==";
}}catch(r){return void D("videoautoplay",!1)}w.setAttribute("autoplay",""),w.style.cssText="display:none",R.appendChild(w),setTimeout(function(){w.addEventListener("playing",A,!1),e=setTimeout(A,t)},0)});var U=p.testStyles=P;Modernizr.addTest("touchevents",function(){var t;if("ontouchstart"in A||A.DocumentTouch&&e instanceof DocumentTouch)t=!0;else{var a=["@media (",h.join("touch-enabled),("),"heartz",")","{#modernizr{top:9px;position:absolute}}"].join("");U(a,function(A){t=9===A.offsetTop})}return t});var S=function(){var A=navigator.userAgent,e=A.match(/w(eb)?osbrowser/gi),t=A.match(/windows phone/gi)&&A.match(/iemobile\/([0-9])+/gi)&&parseFloat(RegExp.$1)>=9;return e||t}();S?Modernizr.addTest("fontface",!1):U('@font-face {font-family:"font";src:url("https://")}',function(A,t){var a=e.getElementById("smodernizr"),n=a.sheet||a.styleSheet,w=n?n.cssRules&&n.cssRules[0]?n.cssRules[0].cssText:n.cssText||"":"",o=/src/i.test(w)&&0===w.indexOf(t.split(" ")[0]);Modernizr.addTest("fontface",o)});var Z="Moz O ms Webkit",F=p._config.usePrefixes?Z.split(" "):[];p._cssomPrefixes=F;var T=function(e){var a,n=h.length,w=A.CSSRule;if("undefined"==typeof w)return t;if(!e)return!1;if(e=e.replace(/^@/,""),a=e.replace(/-/g,"_").toUpperCase()+"_RULE",a in w)return"@"+e;for(var o=0;n>o;o++){var i=h[o],D=i.toUpperCase()+"_"+a;if(D in w)return"@-"+i.toLowerCase()+"-"+e}return!1};p.atRule=T;var b=p._config.usePrefixes?Z.toLowerCase().split(" "):[];p._domPrefixes=b;var q={elem:o("modernizr")};Modernizr._q.push(function(){delete q.elem});var x={style:q.elem.style};Modernizr._q.unshift(function(){delete x.style}),p.testAllProps=u;var G=p.prefixed=function(A,e,t){return 0===A.indexOf("@")?T(A):(-1!=A.indexOf("-")&&(A=i(A)),e?u(A,e,t):u(A,"pfx"))};Modernizr.addTest("batteryapi",!!G("battery",navigator),{aliases:["battery-api"]}),Modernizr.addTest("forcetouch",function(){return y(G("mouseforcewillbegin",A,!1),A)?MouseEvent.WEBKIT_FORCE_AT_MOUSE_DOWN&&MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN:!1}),Modernizr.addTest("fullscreen",!(!G("exitFullscreen",e,!1)&&!G("cancelFullScreen",e,!1))),Modernizr.addTest("gamepads",!!G("getGamepads",navigator)),Modernizr.addAsyncTest(function(){var e;try{e=G("indexedDB",A)}catch(t){}if(e){var a="modernizr-"+Math.random(),n=e.open(a);n.onerror=function(){n.error&&"InvalidStateError"===n.error.name?D("indexeddb",!1):(D("indexeddb",!0),g(e,a))},n.onsuccess=function(){D("indexeddb",!0),g(e,a)}}else D("indexeddb",!1)}),Modernizr.addTest("pointerlock",!!G("exitPointerLock",e)),Modernizr.addTest("requestanimationframe",!!G("requestAnimationFrame",A),{aliases:["raf"]}),Modernizr.addTest("vibrate",!!G("vibrate",navigator)),Modernizr.addTest("webintents",!!G("startActivity",navigator)),Modernizr.addTest("lowbattery",function(){var A=.2,e=G("battery",navigator);return!!(e&&!e.charging&&e.level<=A)}),Modernizr.addTest("filesystem",!!G("requestFileSystem",A)),Modernizr.addTest("speechrecognition",!!G("SpeechRecognition",A)),Modernizr.addTest("getusermedia",!!G("getUserMedia",navigator)),p.testAllProps=v,Modernizr.addTest("cssanimations",v("animationName","a",!0)),n(),w(f),delete p.addTest,delete p.addAsyncTest;for(var W=0;W<Modernizr._q.length;W++)Modernizr._q[W]();A.Modernizr=Modernizr}(window,document);
var FYO = FYO || {};

(function () {
    'use strict';

    function Picture(cb) {
        this.width = 320;    // We will scale the photo width to this
        this.height = 0;     // This will be computed based on the input stream

        this.streaming = false;

        this.video = null;
        this.canvas = null;
        this.photo = null;
        this.startbutton = null;

        this._resultCB = cb;

        this.Init();
    }

    Picture.prototype = {
        Init: function () {
            var self = this;

            this.container = document.createElement('div');
            this.container.setAttribute('class', 'fyo-container');

            this.photoContainer = document.createElement('div');
            this.photoContainer.setAttribute('class', 'fyo-picture');

            this.video = document.createElement('video');
            this.canvas = document.createElement('canvas');
            this.canvas.setAttribute('style', 'display:none');
            this.photo = document.createElement('img');
            this.photo.setAttribute('style', 'display:none');

            this.startbutton = document.createElement('a');
            this.startbutton.setAttribute('href', 'javascript:void(0);');
            this.startbutton.setAttribute('class', 'btn btn-primary');
            this.startbutton.innerText = 'Take Picture';

            this.cancelbutton = document.createElement('a');
            this.cancelbutton.setAttribute('href', 'javascript:void(0);');
            this.cancelbutton.setAttribute('class', 'btn btn-primary');
            this.cancelbutton.innerText = 'Cancel';

            this.flipbutton = document.createElement('a');
            this.flipbutton.setAttribute('href', 'javascript:void(0);');
            this.flipbutton.setAttribute('class', 'btn btn-primary');
            this.flipbutton.innerText = 'Flip Camera';

            this.photoContainer.appendChild(this.video);
            this.photoContainer.appendChild(this.canvas);
            this.photoContainer.appendChild(this.photo);
            this.photoContainer.appendChild(this.startbutton);
            this.photoContainer.appendChild(this.cancelbutton);
            this.photoContainer.appendChild(this.flipbutton);
            this.container.appendChild(this.photoContainer);

            document.body.appendChild(this.container);


            function videoCanPlay(ev) {
                self.height = self.video.videoHeight / (self.video.videoWidth / self.width);

                self.video.setAttribute('width', self.width);
                self.video.setAttribute('height', self.height);
                self.canvas.setAttribute('width', self.width);
                self.canvas.setAttribute('height', self.height);
                self.streaming = true;
            }
            this.video.addEventListener('canplay', videoCanPlay, false);


            function orientationChange() {
                self._orientationChange();
            }
            window.addEventListener('orientationchange', orientationChange);


            this.__cleanup = function () {
                window.removeEventListener("orientationchange", orientationChange);
                self.video.removeEventListener('canplay', videoCanPlay);
                self.video.srcObject = null;
                self.video.src = null;
            }
            
            FYO.IOHelper.GetDevices(function (result) {
                console.log(result);
                self.devices = result.videoInput;
                self.currDevice = 0;
                if (self.devices.length == 0) {
                    // no camera to use...
                    alert('no camera');
                }

                if (self.devices.length == 1) {
                    // no cameras to cycle through
                    self.photoContainer.removeChild(self.flipbutton);
                }

                if (self.devices.length > 2) {
                    self.flipbutton.innerText = 'Next Camera';
                }

                self._startVideo();
            });

            this.startbutton.addEventListener('click', function (ev) {
                self.Take();
                ev.preventDefault();
            }, false);

            this.cancelbutton.addEventListener('click', function (ev) {
                self.Cancel();
                ev.preventDefault();
            }, false);

            this.flipbutton.addEventListener('click', function (ev) {
                self.currDevice++;
                self._startVideo();
                ev.preventDefault();
            }, false);
        },

        _orientationChange: function () {
            this._startVideo();
        },

        _startVideo: function () {
            var self = this;
            navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: self.devices[self.currDevice % self.devices.length].deviceId }  }, audio: false })
                .then(function (stream) {
                    self.video.srcObject = stream;
                    self.video.play();
                })
                .catch(function (err) {
                    console.log("An error occured! " + err);
                });
        },

        Clear: function () {
            var context = this.canvas.getContext('2d');
            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvas.width, canvas.height);

            var data = canvas.toDataURL('image/png');
            this.photo.setAttribute('src', data);
        },

        Take: function () {
            var context = this.canvas.getContext('2d');
            if (this.width && this.height) {
                this.canvas.width = this.width;
                this.canvas.height = this.height;
                context.drawImage(this.video, 0, 0, this.width, this.height);

                var data = this.canvas.toDataURL('image/png');
                
                this._resultCB && this._resultCB(data);

                this._cleanup();
            } else {
                this.Clear();
            }
        },

        Cancel: function () {
            this._cleanup();
        },

        _cleanup: function () {
            document.body.removeChild(this.container);
            this.__cleanup && this.__cleanup();
        }
    };

    FYO.Picture = Picture;
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

    function ThumbStick(connector, options) {
        options = options || {};

        this.connector = connector;

        this.element = null;
        this.mouseX = 0; this.mouseY = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.x = 0;
        this.y = 0;

        this.events = new FYO.EventManager(100); // 10 per second

        if (options.onmoved) {
            this.events.on('moved', options.onmoved);
        }

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate || function () { };

        this.Init(options);
    }

    ThumbStick.prototype = {

        element: null,
        mouseX: 0, mouseY: 0,
        windowHalfX: window.innerWidth / 2,
        windowHalfY: window.innerHeight / 2,
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

        Init: function (options) {
            var self = this;

            this.element = document.getElementById(options.id);

            this.elementHalfX = this.element.clientWidth / 2;
            this.elementHalfY = this.element.clientHeight / 2;

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
        onTouchStart: function (event) {
            navigator.vibrate(10);
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
            event.stopPropagation && event.stopPropagation();
            event.cancelBubble = true;
            event.returnValue = false;
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
        }
    };

    FYO.ThumbStick = ThumbStick;
})();
var FYO = FYO || {};

(function () {
    'use strict';

    function ThumbStick2D(connector, options) {
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

        this.events = new FYO.EventManager(100); // 10 per second

        if (options.onmoved) {
            this.events.on('moved', options.onmoved);
        }

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate || function () { };

        this.Init(options);
    }

    ThumbStick2D.prototype = {

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


            //
            this.elementHalfX = this.element.clientWidth / 2;
            this.elementHalfY = this.element.clientHeight / 2;


            this.image = document.createElement('div');
            var style = 'background: url(\'' + (options.image || '/fyogametable/assets/imgs/Thumbstick2D.png') + '\') no-repeat center center;';
            style += 'background-size: contain; width: 100%; height: 100%;'
            this.image.setAttribute('style', style);

            this.element.appendChild(this.image);
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
        onTouchStart: function (event) {
            navigator.vibrate(10);
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
        }
    };

    FYO.ThumbStick2D = ThumbStick2D;
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

        this.events = new FYO.EventManager(100); // 10 per second

        if (options.onmoved) {
            this.events.on('moved', options.onmoved);
        }

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate || function () { };

        this.Init(options);
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
            loader.load('/fyogametable/assets/objs/LeftThumb.obj', function (object) {
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
                self.Render();
            }, onProgress, onError);
            loader.load('/fyogametable/assets/objs/LeftThumbBase.obj', function (object) {
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material.color = new THREE.Color(0x222222);
                    }
                });
                object.position.y = 0;
                self.scene.add(object);
                self.Render();
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
            this.Render();
        },

        onWindowResize: function () {
            this.elementHalfX = this.element.clientWidth / 2;
            this.elementHalfY = this.element.clientHeight / 2;
            this.camera.aspect = this.elementHalfX / this.elementHalfY;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
            this.Render();
        },
        onMouseMove: function (event) {
            event.preventDefault();
            this.mouseX = event.offsetX;
            this.mouseY = event.offsetY;
            this._update();
            this.Render();
        },
        onMouseLeave: function (event) {
            event.preventDefault();
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
            this._update();
            this.Render();
        },
        onTouchStart: function (event) {
            navigator.vibrate(10);
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
            this.Render();
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
            this.Render();
        },
        onTouchDone: function (event) {
            event.preventDefault();
            this.mouseX = this.elementHalfX;
            this.mouseY = this.elementHalfY;
            this._update();
            navigator.vibrate(10);
            this.Render();
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