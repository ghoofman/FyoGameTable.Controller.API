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