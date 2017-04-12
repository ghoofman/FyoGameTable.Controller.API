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

        this.events = new FYO.EventManager();

        if (options.onmoved) {
            this.events.on('moved', options.onmoved);
        }

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

        this.Init(options);
        this.Animate();
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
                this.thumbObj.rotation.x = this.y / 4.0;
                this.thumbObj.rotation.z = this.x / 4.0;
            }

            this.renderer.render(this.scene, this.camera);
        }
    };

    FYO.DPad3D = DPad3D;
})();