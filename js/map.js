function Success() {
var map;
var infoWindow = new google.maps.InfoWindow();

// Favorite locations
var locations = [
        {
          title: 'The dam of the City Pond',
          lat: 56.837688,
          lng: 60.603895,
          wiki: 'Плотина Городского пруда на реке Исеть'
        },
        {
          title: 'Museum of the first president of Russia: Yeltsin',
          lat: 56.843679,
          lng: 60.591385,
          wiki: 'Ельцин-центр'
        },
        {
          title: '"Temple on blood". The place where the last Russian emperor was shot.',
          lat: 56.844364,
          lng: 60.60894,
          wiki: 'Храм на Крови (Екатеринбург)'
        },
        {
          title: 'My school. Which I finished in 2006',
          lat: 56.838368,
          lng: 60.600015,
          wiki: 'Гимназия № 9 (Екатеринбург)'
        },
        {
          title: 'Opera and Ballet Theatre',
          lat: 56.839534,
          lng: 60.616412,
          wiki: 'Екатеринбургский театр оперы и балета'
        },
        {
          title: 'Our Goverment',
          lat: 56.837491,
          lng: 60.597531,
          wiki: 'Здание Свердловского городского совета народных депутатов'
        },
        {
          title: 'Central Mall',
          lat: 56.837526,
          lng:  60.595846,
          wiki: 'Банковский переулок (Екатеринбург)'
        }
      ];
// ViewModel function
var ViewModel = function() {
  // Knockout array
  var self = this;
  self.locationList = ko.observableArray([]);
  self.filteredLocationList = ko.observableArray([]);

  // Create the google map zoomed in on Ekaterinburg
  self.initMap = function() {
   map = new google.maps.Map(document.getElementById('map'), {
      center: {lat:56.840403, lng: 60.602660},
      zoom: 14
    });
  };
  // Create the list of locations from the locations-array
  self.buildLocations = function() {
    locations.forEach(function(locateItem) {
      self.locationList.push( new Place(locateItem) );
    });
  };

  // Set up an event listener for clicks for each Location
  self.setLocationClickFunctions = function() {
    self.locationList().forEach(function(location) {
      google.maps.event.addListener(location.marker(), 'click', function() {
        self.locationClick(location);
      });
    });
  };
  // Function when click on a location (in list or marker)
  self.locationClick = function(location) {
    // Set the content of the infoWindow
    var infoContent = '<div class="marker-title">' + location.title() + '</div><div id="pano"></div>'+
    '<div id=wiki></div>'

    infoWindow.setContent(infoContent);
    // Center clicked marker
    map.panTo(new google.maps.LatLng(location.lat(), location.lng()));
    // Open infoWindow
    infoWindow.open(map, location.marker());
    // Animation
    self.locationAnimateClick(location);
    // panorama
    self.panoramaView(location);
    // wikipedia
    self.wikiInfo(location);
  };
  // Animation for marker
  self.locationAnimateClick = function(location) {
    if (location.marker().getAnimation() !== null) {
      location.marker().setAnimation(null);
    } else {
      location.marker().setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){ location.marker().setAnimation(null); }, 750);
    }
  };
  // Wikipedia API
  self.wikiInfo = function(location) {
    $('#wiki').text("");
    // var for wiki API request
    var wikiUrl = 'https://ru.wikipedia.org/w/api.php?action=opensearch&search=' + location.marker().wiki +'&format=json';
    // If there no info - talk to user
    var wikiRequestTimeout = setTimeout(function(){
      $('#wiki').append('Data could not be retrieved from wiki.');
    }, 8000);
    // Start ajax
    $.ajax(wikiUrl, {
    dataType: "jsonp",
    success: function( response ) {
      var articleList = response[1];
      for (var i = 0; i < articleList.length; i++) {
        articleStr = articleList[i];
        // Add a link to wikipedia
        var url = 'https://ru.wikipedia.org/wiki/'+ articleStr;
        $('#wiki').append('<a href="'+ url + '"target="_blank">'
        + 'Open Wikipedia for more info</a>');
      };
        clearTimeout(wikiRequestTimeout);
    }
  });
};

  // Panorama for marker
  self.panoramaView = function(location) {
    // Adding streetView panorama
    var streetViewService = new google.maps.StreetViewService();
    var radius = 40;
    function getStreetView(data, status) {
      // Checking status of streetview
        if (status == google.maps.StreetViewStatus.OK) {
            var nearStreetViewLocation = data.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, location.marker().position);
            // Propetries for panorama
            var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                  heading: heading,
                  pitch: 15
                }
              };
            var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
        } else {
            infowindow.setContent('<div class="marker-title">' + location.marker().title + '</div>' +
                '<div>No Street View Found for '+  location.marker().title + '</div>');
      }
    }
    streetViewService.getPanoramaByLocation(location.marker().position, radius, getStreetView);
  };

  // Function to filter locations
  self.filterLocations = function() {
    // Set the filtered locations list to an empty array
    self.filteredLocationList([]);
    // Get the search string and the length of the original location list
    var searchString = $('#search-str').val().toLowerCase();
    // Loop through each location in the locations list
    for (var i = 0; i < self.locationList().length; i++) {
      // Get the current location title
      var locationName = self.locationList()[i].title().toLowerCase();
      // If the title match the search string,
      // add the location to the filtered location list
      if (locationName.indexOf(searchString) > -1)  {
        self.filteredLocationList.push(self.locationList()[i]);
        // Set the map property of the marker to the map
        self.locationList()[i].marker().setMap(map);
      } else {
        // Set the map property of the marker to null so it won't be visible
        self.locationList()[i].marker().setMap(null);
      }
    }
  };
  // Return full list if click on "reset"
  self.resetFiltering = function() {
      for (var i = 0; i < self.locationList().length; i++) {
        self.locationList()[i].marker().setMap(map);
      };
      self.filteredLocationList(self.locationList());
  };

  google.maps.event.addDomListener(window, 'load', function() {
    self.initMap();
    self.buildLocations();
    self.setLocationClickFunctions();
    self.filteredLocationList(self.locationList());
  });
}
// Starts everything
ko.applyBindings( new ViewModel() );

// Data for marker
var Place = function(data) {
  // Set all the properties as knockout observables
  var marker;
  this.title = ko.observable(data.title);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.wiki = ko.observable(data.wiki);
  // Google Maps Marker for this location
  marker = new google.maps.Marker({
    position: new google.maps.LatLng(this.lat(), this.lng()),
    map: map,
    title: this.title(),
    wiki: this.wiki(),
    animation: google.maps.Animation.DROP
  });
  // Set the marker as a knockout observable
  this.marker = ko.observable(marker);
};
}

function googleError() {
  window.alert("Sorry it's problem with Google Maps API");
}
