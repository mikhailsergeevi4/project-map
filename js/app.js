
var map;
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:56.821933, lng:60.621233},
    zoom: 12
  });

  var locations = [
          {title: 'The dam of the City Pond', location: {lat: 56.837688, lng: 60.603895}},
          {title: 'Museum of the first president of Russia: Yeltsin', location: {lat: 56.843679, lng:  60.591385}},
          {title: '"Temple on blood". The place where the last Russian emperor was shot.',
                                        location: {lat: 56.844364, lng: 60.60894}},
          {title: 'My school. Which I finished in 2006', location: {lat: 56.838368, lng: 60.600015}},
          {title: 'Opera and Ballet Theatre', location: {lat: 56.839534, lng:  60.616412}},
          {title: 'Our Goverment', location: {lat: 56.837491, lng: 60.597531}},
          {title: 'Central Mall', location: {lat: 56.837526, lng:  60.595846}}
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
                  infowindow.setContent('<div class="marker-title">' + marker.title +
                   '</div><div id="pano"></div>');
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
                  infowindow.setContent('<div class="marker-title">' + marker.title + '</div>' +
                      '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 40 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Geocoding adress

          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
}
