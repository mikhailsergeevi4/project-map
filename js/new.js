var markers = [];
var locations = [
        {title: 'The dam of the City Pond', location: {lat: 56.837688, lng: 60.603895}},
        {title: 'Museum of the first president of Russia: Yeltsin', location: {lat: 56.843679, lng: 60.591385}},
        {title: '"Temple on blood". The place where the last Russian emperor was shot.',
                                      location: {lat: 56.844364, lng: 60.60894}},
        {title: 'My school. Which I finished in 2006', location: {lat: 56.838368, lng: 60.600015}},
        {title: 'Opera and Ballet Theatre', location: {lat: 56.839534, lng:  60.616412}},
        {title: 'Our Goverment', location: {lat: 56.837491, lng: 60.597531}},
        {title: 'Central Mall', location: {lat: 56.837526, lng:  60.595846}}
      ];
function initMap() {
  var geocoder = new google.maps.Geocoder;
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:56.840403, lng: 60.602660},
    zoom: 14
  });
  var infowindow = new google.maps.InfoWindow();
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    var marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: position,
      title: title,
      //address: "visit" + getAddress(locations[i].location)
    });
    markers.push(marker);
    marker.addListener('click', function() {
        populateInfoWindow(this, infowindow);
    });

    marker.addListener('click', function() {
      toggleBounce(this);
    });
  }
}

function populateInfoWindow(marker, infowindow) {
  // Content for InfoWindow
  infowindow.setContent('<div class="marker-title">' + marker.title +
   '</div><div id="pano"></div><div>' + marker.address +'</div>');
  // Adding streetView panorama
  var streetViewService = new google.maps.StreetViewService();
  var radius = 40;
  function getStreetView(data, status) {
    // Checking status of streetview
      if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
              nearStreetViewLocation, marker.position);
          // Propetries for panorama
          var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 25
              }
            };
          var panorama = new google.maps.StreetViewPanorama(
              document.getElementById('pano'), panoramaOptions);
      } else {
          infowindow.setContent('<div class="marker-title">' + marker.title + '</div>' +
              '<div>No Street View Found for '+ + marker.address + '</div>');
    }
  }
  // Use streetview service to get the closest streetview image within
  // 40 meters of the markers position
  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  // Open infowindow
  infowindow.open(map, marker);
}

function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 750);
  }
}

/*function getAddress(coord) {
var geocoder = new google.maps.Geocoder;

  geocoder.geocode({'location': coord}, function(results, status) {
  if (status == google.maps.GeocoderStatus.OK) {
    if (results[0]) {
      return coord;
    } else {
    window.alert('No results found');
    }
  } else {
  window.alert('Geocoder failed due to: ' + status);
  }
});
}
*/

/*function initialize(thing) {
        var fenway = {lat: 42.345573, lng: -71.098326};
        var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), {
              position: thing,
              pov: {
                heading: 34,
                pitch: 10
              }
            });
        map.setStreetView(panorama);
      }
*/
