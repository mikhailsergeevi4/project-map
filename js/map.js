function Success() {
var map;
var infoWindow = new google.maps.InfoWindow();


// ViewModel function
var ViewModel = function() {
  // Knockout array
  var self = this;
  self.locationList = ko.observableArray([]);


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
    var infoContent = '<div class="marker-title">' + location.title + '</div><div id="pano"></div>'+
    '<div id="wiki"></div>';

    infoWindow.setContent(infoContent);
    // Center clicked marker
    map.panTo(new google.maps.LatLng(location.lat, location.lng));
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
      setTimeout(function(){ location.marker().setAnimation(null); }, 700);
    }
  };
  // Wikipedia API
  self.wikiInfo = function(location) {
  //  $('#wiki').text("");
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
        var html_url = '<div id="wiki"><a href="'+ url + '"target="_blank">' + 'Open Wikipedia for more info</a></div>'
        //infoWindow.setContent(html_)
        //$('#wiki').append('<a href="'+ url + '"target="_blank">' + 'Open Wikipedia for more info</a>');
      }
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
  self.filter = ko.observable("");

      this.filteredLocationList = ko.dependentObservable(function() {
        var filter = this.filter().toLowerCase();

        if (!filter) {
        // Return self.locationList() the original array;
        return ko.utils.arrayFilter(self.locationList(), function(location) {
          location.marker().setVisible(true);
          return true;
        });
        } else {
          return ko.utils.arrayFilter(this.locationList(), function(location) {
            if (location.title.toLowerCase().indexOf(filter) >= 0) {
            return true;
            } else {
              location.marker().setVisible(false);
            return false;
            }
          });
        }
      }, this);

  google.maps.event.addDomListener(window, 'load', function() {
    self.initMap();
    self.buildLocations();
    self.setLocationClickFunctions();
    //self.filteredLocationList(self.locationList());

  });
};
// Starts everything
ko.applyBindings( new ViewModel() );

// Data for marker
var Place = function(data) {
  // Set all the properties as knockout observables
  var marker;
  this.title = data.title;
  this.lat = data.lat;
  this.lng = data.lng;
  this.wiki = data.wiki;
  // Google Maps Marker for this location
  marker = new google.maps.Marker({
    position: new google.maps.LatLng(this.lat, this.lng),
    map: map,
    title: this.title,
    wiki: this.wiki,
    animation: google.maps.Animation.DROP
  });
  // Set the marker as a knockout observable
  this.marker = ko.observable(marker);
};
}

function googleError() {
  window.alert("Sorry it's problem with Google Maps API");
}




function openDrawer() {
  var menu = document.querySelector('#menu');
  var container = document.querySelector('.container-fluid');
  var drawer = document.querySelector('.nav');

  menu.addEventListener('click', function(e) {
    drawer.classList.toggle('open');
    drawer.classList.toggle('open');
    e.stopPropagation();
  });
  container.addEventListener('click', function() {
    drawer.classList.remove('open');
  });
};
