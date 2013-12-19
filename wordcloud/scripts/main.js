starter.wait(function () {

    var map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(-43.38, 171.22),
        zoom: 11,
        //mapTypeId: google.maps.MapTypeId.ROADMAP,
        //mapTypeId: google.maps.MapTypeId.HYBRID,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        disableDefaultUI: true,
        rotateControl: true,
    });

    var markers = [
        new google.maps.Marker({
            position: new google.maps.LatLng(-43.38, 171.22),
            map: map,
            title: 'Tim'
        }),
        new google.maps.Marker({
            position: new google.maps.LatLng(-43.43, 171.18),
            map: map,
            title: 'Jerry'
        }),
        new google.maps.Marker({
            position: new google.maps.LatLng(-43.41, 171.33),
            map: map,
            title: 'Russel'
        }),
        new google.maps.Marker({
            position: new google.maps.LatLng(-43.415, 171.34),
            map: map,
            title: 'Russel'
        })
    ];

    //===========================================================================================================//

    var wordCloud = new WordCloud('wordcloud', constants.FONT_WEIGHT, constants.FONT_NAME);

    wordCloud.putWord('scrub', 13);
    wordCloud.putWord('plume', 10);
    wordCloud.putWord('black', 8);
    wordCloud.putWord('fire', 7);
    wordCloud.putWord('wind-driven', 4);
    wordCloud.putWord('dead', 2);

    wordCloud.paint();

    //===========================================================================================================//

    var elements = {
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
    };

    var counters = {
        minutes: 0,
        seconds: 0,
    };

    var pad = function (number) {
        return ("0" + number.toString()).slice(-2);
    };
    
    var timer = window.setInterval(function() {

        counters.seconds++;
        if (counters.seconds >= 60) {
            counters.minutes++;
            counters.seconds = 0;
            elements.minutes.innerHTML = pad(counters.minutes);
        } 
        elements.seconds.innerHTML = pad(counters.seconds);
    }, 1000);
});