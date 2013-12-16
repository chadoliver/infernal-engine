var starter = (function () {
    // use like this: starter.wait( callback );

    var Buffer = (function () {

        function Buffer(numSignals) {
            this.numSignals = numSignals;
            this.counter = 0;
            this.called = false;
        }

        Buffer.prototype.maybeCall = function () {
            if (this.counter >= this.numSignals) {
                if (!this.called) {
                    this.storedCallback();
                    this.called = true;
                }
            }
        };

        Buffer.prototype.signal = function () {
            this.counter++;
            this.maybeCall();
        };

        Buffer.prototype.wait = function (callback) {
            this.storedCallback = callback;
            this.maybeCall();
        };

        return Buffer;
    })();

    // cross browser way to add an event listener
    function addListener(event, obj, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(event, fn, false);
        } else {
            obj.attachEvent("on" + event, fn);
        }
    }

    var starter = new Buffer(2);

    // WebFont comes from <script src="//ajax.googleapis.com/ajax/libs/webfont/1/webfont.js"></script>
    WebFont.load({
        google: { families: [constants.FONT_NAME + ':' + constants.FONT_WEIGHT] },
        active: starter.signal.bind(starter),
    });

    addListener('load', window, starter.signal.bind(starter));

    return starter;
})();
