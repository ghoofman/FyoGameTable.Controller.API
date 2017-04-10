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