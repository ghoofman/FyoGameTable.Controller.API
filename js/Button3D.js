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