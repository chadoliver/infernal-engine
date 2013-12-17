angular.module('constants', []).factory('config', function() {
    
    var constants = {
        DEBUG: false,

        NUM_CHANNELS : 4,
        ALPHA_CHANNEL: 3,

        FONT_WEIGHT: 300,
        FONT_NAME: 'Open Sans',   //'Open Sans Condensed'
        TEXT_BASELINE: 'top',

        BLUR_RADIUS: 10,

        ordering: {
            DISTANCE: 0,
            RANDOM: 1,
        },

        whitePixels: {
            EXCLUE: 0,
            INCLUDE: 1,
        },
    };

    return constants;
});

