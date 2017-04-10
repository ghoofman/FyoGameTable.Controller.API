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