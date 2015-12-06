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
        width: 500, height: 500,
        //bounds: initialViewBounds,
        zoom: zoom,
        center: new Microsoft.Maps.Location(latitude, longitude),
        showCopyright: false //IMPORTANT: Bing Maps Platform API Terms of Use requires copyright information to be displayed. Only set this option to false when copyright information is displayed through alternate means.
    };
    map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), mapOptions);
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: createWalkingRoute });
    createWalkingRoute();
}

function createDirectionsManager() {
    var displayMessage;
    if (!directionsManager) {
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
        displayMessage = 'Directions Module loaded\n';
        displayMessage += 'Directions Manager loaded';
    }
    //alert(displayMessage);
    directionsManager.resetDirections();
    directionsErrorEventObj = Microsoft.Maps.Events.addHandler(directionsManager, 'directionsError', function (arg) { /*alert(  arg.message );*/ });
    directionsUpdatedEventObj = Microsoft.Maps.Events.addHandler(directionsManager, 'directionsUpdated', function () {/* alert("Directions updated")*/ });
}

function createWalkingRoute() {
    if (!directionsManager) { createDirectionsManager(); }
    directionsManager.resetDirections();
    // Set Route Mode to walking 
    directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking });
    var seattleWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: '1234 Market St, Philadelphia, PA' });
    directionsManager.addWaypoint(seattleWaypoint);
    var redmondWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: '1401 JFK Blvd, Philadelphia, PA' });
    directionsManager.addWaypoint(redmondWaypoint);
    // Set the element in which the itinerary will be rendered
    //directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('directionsItinerary') });
    //alert('Calculating directions...');
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