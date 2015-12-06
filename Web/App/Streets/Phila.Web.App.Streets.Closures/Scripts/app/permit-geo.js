var map = null;
var directionsManager;
var directionsErrorEventObj;
var directionsUpdatedEventObj;

function loadMap() {
    //var initialViewBounds = Microsoft.Maps.LocationRect.fromCorners(new Microsoft.Maps.Location(40.142140, -75.305099), new Microsoft.Maps.Location(39.840177, -74.927444));

    var latitude;
    var longitude;
    var zoom = 10;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (loc) {
            latitude = loc.coords.latitude;
            longitude = loc.coords.longitude;
            zoom = 15;
            renderMap(latitude, longitude, zoom);
        },
            function (error) {
                latitude = 39.95;
                longitude = -75.166667;
                renderMap(latitude, longitude, zoom);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    } else {
        latitude = 39.95;
        longitude = -75.166667;
        console.log("Geolocation is not supported by this browser.");

        renderMap(latitude, longitude, zoom);
    }


}

function renderMap(latitude, longitude, zoom) {
    var mapOptions = {
        credentials: "AnSM9TY1CIflUjbddXDbTF6-tmK2C0jI3sqgOvsHy0ia0xC9mrQ9moD3yjf1pBZ1",
        enableSearchLogo: false,
        enableClickableLogo: false,
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        width: 500,//$(".flexible-container").css("width"), //document.body.offsetWidth - 40,
        height: 300,
        //bounds: initialViewBounds,
        zoom: zoom,
        center: new Microsoft.Maps.Location(latitude, longitude),
        showCopyright: false //IMPORTANT: Bing Maps Platform API Terms of Use requires copyright information to be displayed. Only set this option to false when copyright information is displayed through alternate means.
    };
    map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), mapOptions);

    Microsoft.Maps.Events.addHandler(map, 'click', getLatLng);

    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: createWalkingRoute });
    Microsoft.Maps.loadModule('Microsoft.Maps.Search', { callback: searchModuleLoaded });
    createWalkingRoute();
    searchModuleLoaded();


}

function getLatLng(e) {
    //console.log(e);
    if (e.targetType == "map") {
        var point = new Microsoft.Maps.Point(e.getX(), e.getY());
        var locTemp = e.target.tryPixelToLocation(point);
        var location = new Microsoft.Maps.Location(locTemp.latitude, locTemp.longitude);
        console.log(locTemp.latitude + "&" + locTemp.longitude);


        var pin = new Microsoft.Maps.Pushpin(location, { draggable: true });

        map.entities.push(pin);

    }
}

function searchModuleLoaded() {
    console.log("searchModuleLoaded");
    var searchManager = new Microsoft.Maps.Search.SearchManager(map);
    var searchRequest = { where: '100 S BROAD ST, PHILADELPHIA, PA', count: 5, callback: searchCallback, errorCallback: searchError };
    searchManager.search(searchRequest);
}

function searchCallback(searchResponse, userData) {
    //console.log("searchCallback");
    //console.log(searchResponse.parseResults[0].location.location);
    //console.log("The first search result is " + searchResponse.parseResults[0].location.name + ".");

    var pushpin = new Microsoft.Maps.Pushpin(map.getCenter(), { draggable: true });
    map.entities.push(pushpin);
    pushpin.setLocation(new Microsoft.Maps.Location(searchResponse.parseResults[0].location.location.latitude, searchResponse.parseResults[0].location.location.longitude));
    //console.log('Pushpin Location Updated to ' + pushpin.getLocation() + '. Pan map to location, if pushpin is not visible');
}


function searchError(searchRequest) {
    alert("An error occurred.");
}

function createDirectionsManager() {
    var displayMessage;
    if (!directionsManager) {
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
        displayMessage = 'Directions Module loaded\n';
        displayMessage += 'Directions Manager loaded';
    }
    console.log(displayMessage);
    directionsManager.resetDirections();
    directionsErrorEventObj = Microsoft.Maps.Events.addHandler(directionsManager, 'directionsError', function(arg) {
        // console.log(  arg.message );
    });
    directionsUpdatedEventObj = Microsoft.Maps.Events.addHandler(directionsManager, 'directionsUpdated', function (result) {
       // console.log("Directions updated");
        
        console.log(result);

        if (result &&
            result.resourceSets &&
            result.resourceSets.length > 0 &&
            result.resourceSets[0].resources &&
            result.resourceSets[0].resources.length > 0) {

            console.log(result);

            // Set the map view
            var bbox = result.resourceSets[0].resources[0].bbox;
            var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(bbox[0], bbox[1]), new Microsoft.Maps.Location(bbox[2], bbox[3]));
            map.setView({ bounds: viewBoundaries });
            map.setOptions({ zoom: 15 });
        }        
    });
}

function createWalkingRoute() {
    if (!directionsManager) { createDirectionsManager(); }
    directionsManager.resetDirections();
    // Set Route Mode to walking 
    directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking });
    var waypoint0 = new Microsoft.Maps.Directions.Waypoint({ address: '200 S BROAD ST, PHILADELPHIA, PA' });
    directionsManager.addWaypoint(waypoint0);
    var waypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: 'INTREPID AVE, Philadelphia, PA' });
    directionsManager.addWaypoint(waypoint1);
    //var waypoint2 = new Microsoft.Maps.Directions.Waypoint({ address: 'ZINKOFF BLVD, Philadelphia, PA' });
    //directionsManager.addWaypoint(waypoint2);
    // Set the element in which the itinerary will be rendered
    //directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('directionsItinerary') });
    console.log('Calculating directions...');
    directionsManager.calculateDirections();

    
}

function createDirections() {
    if (!directionsManager) {
        Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: createWalkingRoute });
    }
    else {
        createWalkingRoute();
    }
}