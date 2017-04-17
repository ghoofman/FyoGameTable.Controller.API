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
        _getDevices: function (cb) {
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
        },

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

            this._getBattery(function (battery) {

                result.isDesktop = !battery || (battery.charging && battery.chargingTime == 0);

                if (battery) {
                    result.battery = {
                        charging: battery.charging,
                        chargingTime: battery.chargingTime,
                        dischargingTime: battery.dischargingTime,
                        level: battery.level
                    };
                }

                self._getDevices(function (devices) {
                    result.devices = devices;

                    cb && cb(result);
                });

            });
        }
    };

    FYO.IOHelper = IOHelper;
})();