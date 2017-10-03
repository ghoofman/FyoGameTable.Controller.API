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

        this.events = new FYO.EventManager();

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
            event.stopPropagation && e.stopPropagation();
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