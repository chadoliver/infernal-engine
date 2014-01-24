var starter = (function () {
    // starter is a function which calls your code's entry point once two conditions have been met:
    // 1) The page has finished loading.
    // 2) Google's webfont loader has finished loading the required scripts. (Without the webfont
    //    loader, the first word drawn to the canvas would not be styled correctly.)
    //
    // Use the function like this: starter.wait( callback );

    //============================================================================================//

    // declare a cross-browser way to add an event listener
    var addListener = function(event, obj, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(event, fn, false);
        } else {
            obj.attachEvent("on" + event, fn);
        }
    }

    //============================================================================================//

    var Buffer = (function () {
        // Buffer is a class which will buffer a method (stored with .wait(method)) until .signal
        // has been called `numSignals` times. For example, if we create an instance like so:
        //      var buffer = new Buffer(5);
        //      buffer.wait(callback);
        // Then callback will be executed once we call buffer.signal() 5 times.

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

    //============================================================================================//

    var starter = new Buffer(2);

    // WebFont comes from <script src="//ajax.googleapis.com/ajax/libs/webfont/1/webfont.js"></script>
    WebFont.load({
        // NOTE! If you change the font family or weight, don't forget to also change it in main.js (in the line 'var wordcloud = new Wordcloud...').
        google: { families: ['Open Sans:300'] },
        active: starter.signal.bind(starter),
    });

    addListener('load', window, starter.signal.bind(starter));

    return starter;
})();
