var map = null;
var sessionKey;
var routeLayer;
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
        //console.log("Geolocation is not supported by this browser.");

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

    map.getCredentials(function (c) {
        sessionKey = c;
    });
    routeLayer = new Microsoft.Maps.EntityCollection();
    map.entities.push(routeLayer);

    // click map to add pushpin and get lat long
    //Microsoft.Maps.Events.addHandler(map, 'click', getLatLng);

    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: createWalkingRoute });
    
   // Microsoft.Maps.loadModule('Microsoft.Maps.Search', { callback: searchModuleLoaded });


}


//function getLatLng(e) {
//    //console.log(e);
//    if (e.targetType == "map") {
//        var point = new Microsoft.Maps.Point(e.getX(), e.getY());
//        var locTemp = e.target.tryPixelToLocation(point);
//        var location = new Microsoft.Maps.Location(locTemp.latitude, locTemp.longitude);
//        console.log(locTemp.latitude + "&" + locTemp.longitude);


//        var pin = new Microsoft.Maps.Pushpin(location, { draggable: true });

//        map.entities.push(pin);

//    }
//}

//function searchModuleLoaded() {
//    //console.log("searchModuleLoaded");
//    var searchManager = new Microsoft.Maps.Search.SearchManager(map);
//    var searchRequest = { where: '100 S BROAD ST, PHILADELPHIA, PA', count: 5, callback: searchCallback, errorCallback: searchError };
//    searchManager.search(searchRequest);
//}

//function searchCallback(searchResponse, userData) {
//    //console.log("searchCallback");
//    //console.log(searchResponse.parseResults[0].location.location);
//    //console.log("The first search result is " + searchResponse.parseResults[0].location.name + ".");

//    var pushpin = new Microsoft.Maps.Pushpin(map.getCenter(), { draggable: true });
//    map.entities.push(pushpin);
//    pushpin.setLocation(new Microsoft.Maps.Location(searchResponse.parseResults[0].location.location.latitude, searchResponse.parseResults[0].location.location.longitude));
//    //console.log('Pushpin Location Updated to ' + pushpin.getLocation() + '. Pan map to location, if pushpin is not visible');
//}


//function searchError(searchRequest) {
//    alert("An error occurred.");
//}

function createDirectionsManager() {
    var displayMessage;
    if (!directionsManager) {
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
        displayMessage = 'Directions Module loaded\n';
        displayMessage += 'Directions Manager loaded';
    }
    //console.log(displayMessage);
    directionsManager.resetDirections();
    directionsErrorEventObj = Microsoft.Maps.Events.addHandler(directionsManager, 'directionsError', function(arg) {
        // console.log(  arg.message );
    });
    directionsUpdatedEventObj = Microsoft.Maps.Events.addHandler(directionsManager, 'directionsUpdated', function (result) {

        var totalWaypoints = result.route[0].routeLegs[0].subLegs[0].routePath.decodedLongitudes.length;

        var wpLat = result.route[0].routeLegs[0].subLegs[0].routePath.decodedLatitudes;
        var wpLong = result.route[0].routeLegs[0].subLegs[0].routePath.decodedLongitudes;

        var $locationResults = $("#locationResults");
        $locationResults.html("<br/>FROM ");
        var wp = [];
        var lastWp;
        for (var i = 0; i < totalWaypoints - 1; i++) {
            wp.push(new Microsoft.Maps.Location(wpLat[i], wpLong[i]));
            //console.log(wpLat[i] + ", " + wpLong[i]);
            var url = "https://dev.virtualearth.net/REST/v1/Locations/" + wpLat[i] + "," + wpLong[i];// + "?key=AnSM9TY1CIflUjbddXDbTF6-tmK2C0jI3sqgOvsHy0ia0xC9mrQ9moD3yjf1pBZ1";

            $.ajax({
                type: "GET",
                url: url,
                contentType: "application/json",
                dataType: 'jsonp',
                data: {
                    key: sessionKey
                },
                success: function (data) {
                    if (data &&
                        data.resourceSets &&
                        data.resourceSets.length > 0 &&
                        data.resourceSets[0].resources &&
                        data.resourceSets[0].resources.length > 0) {
                        if ($locationResults.html() == "") {
                            $locationResults.append("<br/> FROM " + data.resourceSets[0].resources[0].address.addressLine);
                        } else if ($locationResults.html().trim() == "<br>FROM") {
                            $locationResults.append(data.resourceSets[0].resources[0].address.addressLine);
                        } else {
                            $locationResults.append("<br/> TO " + data.resourceSets[0].resources[0].address.addressLine);
                        }
                        //}
                        //lastWp = data.resourceSets[0].resources[0].address.addressLine;
                    }
                },
                error: function (e) {
                    console.log("error: " + e.statusText);
                },
                jsonp: "jsonp"
            });
        }

        //routeLayer.clear();

        //var polyline = new Microsoft.Maps.Polyline(wp, null);

        //routeLayer.push(polyline);

        if (result &&
            result.resourceSets &&
            result.resourceSets.length > 0 &&
            result.resourceSets[0].resources &&
            result.resourceSets[0].resources.length > 0) {

            // Set the map view
            //var bbox = result.resourceSets[0].resources[0].bbox;
            //var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(bbox[0], bbox[1]), new Microsoft.Maps.Location(bbox[2], bbox[3]));
            //map.setView({ bounds: viewBoundaries, zoom: 10 });
            map.setView({ center: new Microsoft.Maps.Location(wpLat[0], wpLong[0]) });
            map.setValue({ zoom: 15 });
        }        
    });
}


function createWalkingRoute(fromLocation, toLocation) {
    if (fromLocation == undefined || toLocation == undefined) return;

    //fromLocation "1234 MARKET ST, PHILADELPHIA, PA", "1000 MARKET ST, PHILADELPHIA, PA"
    //console.log(fromLocation, toLocation);
    var phila = ", Philadelphia, PA";
    fromLocation = fromLocation + phila;
    toLocation = toLocation + phila;



    if (!directionsManager) { createDirectionsManager(); }
    directionsManager.resetDirections();
    // Set Route Mode to walking 
    directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking });
    var waypoint0 = new Microsoft.Maps.Directions.Waypoint({ address: fromLocation });
    directionsManager.addWaypoint(waypoint0);
    var waypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: toLocation });
    directionsManager.addWaypoint(waypoint1);
    //var waypoint2 = new Microsoft.Maps.Directions.Waypoint({ address: 'ZINKOFF BLVD, Philadelphia, PA' });
    //directionsManager.addWaypoint(waypoint2);
    // Set the element in which the itinerary will be rendered
    //directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('directionsItinerary') });
    //console.log('Calculating directions...');
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