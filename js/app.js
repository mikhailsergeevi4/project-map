
var map;
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:56.821933, lng:60.621233},
    zoom: 12
  });

  var locations = [
          {title: 'The dam of the City Pond', location: {lat: 56.837688, lng: 60.603895}},
          {title: 'Museum of the first president of Russia: Yeltsin', location: {lat: 56.844627, lng: 60.591981}},
          {title: '"Temple on blood". The place where the last Russian emperor was shot.',
                                        location: {lat: 56.844364, lng: 60.60894}},
          {title: 'My school. Which I finished in 2006', location: {lat: 56.838368, lng: 60.600015}},
          {title: 'Central Stadium. Here will be the Football World Cup 2018.',
                                        location: {lat: 56.832473, lng: 60.573584}},
          {title: 'City Park', location: {lat: 56.816807, lng: 60.636986}},
          {title: 'My Home', location: {lat: 56.795078, lng: 60.626651}}
        ];
        var infowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();
        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
          // Get the position from the location array.
          var position = locations[i].location;
          var title = locations[i].title;
          // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
          });
          // Push the marker to our array of markers.
          markers.push(marker);
          marker.addListener('click', function() {
              populateInfoWindow(this, infowindow);
          });
            bounds.extend(markers[i].position);
        }
          // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);
}

function populateInfoWindow(marker, infowindow) {
   // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('');
          infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick',function(){
                infowindow.setMarker = null;
          });

    // Adding StreetView for infowindow
          var streetViewService = new google.maps.StreetViewService();
          var radius = 40;
    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
          function getStreetView(data, status) {
              if (status == google.maps.StreetViewStatus.OK) {
                  var nearStreetViewLocation = data.location.latLng;
                  var heading = google.maps.geometry.spherical.computeHeading(
                      nearStreetViewLocation, marker.position);
                  infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                  var panoramaOptions = {
                      position: nearStreetViewLocation,
                      pov: {
                        heading: heading,
                        pitch: 25
                      },
                      linksControl: false,
                      panControl: false,
                      enableCloseButton: false
                  };
                  var panorama = new google.maps.StreetViewPanorama(
                      document.getElementById('pano'), panoramaOptions);
              } else {
                  infowindow.setContent('<div>' + marker.title + '</div>' +
                      '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Geocoding adress

          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
      }
}
