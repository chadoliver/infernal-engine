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

    var startTime = Date.now();

    var wordCloud = new WordCloud('wordcloud', constants.FONT_WEIGHT, constants.FONT_NAME);

    wordCloud.putWord('scrub', 13);
    wordCloud.putWord('plume', 10);
    wordCloud.putWord('black', 8);
    wordCloud.putWord('fire', 7);
    wordCloud.putWord('jiff', 5);
    wordCloud.putWord('wind-driven', 4);
    wordCloud.putWord('dead', 3);
    wordCloud.putWord('cheese', 2);
    wordCloud.putWord('wooler', 2);
    wordCloud.putWord('triskele', 2);
    wordCloud.putWord('gasp', 2);
    wordCloud.putWord('hennig', 1);

    wordCloud.paint();

    console.log('seconds:', (Date.now()-startTime)/1000);

    //===========================================================================================================//

    var sampleTimeSpeedup = 10;
    var zeroTime = 60 * 60; // 1 hour

    var timeController = new TimeController(zeroTime, sampleTimeSpeedup);
});
