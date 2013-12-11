
starter.wait(function () {


    var map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(-43.38, 171.22),
        zoom: 11,
        //mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeId: google.maps.MapTypeId.HYBRID,
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

    var width = 400;
    var height = 300;

    var background = new Background('wordcloud', width, height);
    var coordinates = background.getOrderedCoordinates();

    

    var words = [
    	new Word('scrub', 15), 
    	new Word('plume', 10), 
    	new Word('black', 8),
    	new Word('fire', 6), 
    	new Word('wind-driven', 4),
        new Word('northerly', 4),
    	new Word('dead', 2),

    ];

    for (var i=0; i<words.length; i++) words[i].paint(background);

	var center = new Coordinate(width/2,height/2);
	center.paint(background.canvas);

});
