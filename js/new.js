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
  // start google map
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:56.840403, lng: 60.602660},
    zoom: 14
  });
  // infowindow for markers
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
      });
    markers.push(marker);
    // click functions for markers
    marker.addListener('click', function() {
        populateInfoWindow(this, infowindow);
    });

    marker.addListener('click', function() {
      toggleBounce(this);
    });
  }
  // Making list of locations
  var Loc = function(data) {
    this.title = ko.observable(data.title);
  };
  var ViewModel = function() {
    var self = this;
    this.markerList = ko.observableArray([]);
    markers.forEach(function(markItem){
      self.markerList.push( new Loc(markItem) );
    });

  };
ko.applyBindings(new ViewModel());
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
  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  // Open infowindow
  infowindow.open(map, marker);
}

// bouncing onclick markers
function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 750);
  }
}
