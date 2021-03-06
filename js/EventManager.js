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