function Success() {
  var infoWindow = new google.maps.InfoWindow();

    // Create the google map zoomed in on Ekaterinburg
    var Mapping = function() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:56.840403, lng: 60.602660},
        zoom: 14
      });
      // Starts everything
      ko.applyBindings( new ViewModel() );
};


  // ViewModel function
  function ViewModel() {
    // Knockout array
    var self = this;
    self.locationList = ko.observableArray([]);

    // Create the list of locations from the locations-array
      locations.forEach(function(locateItem) {
        self.locationList.push( new Place(locateItem) );
      });

    // Function to filter locations
    this.filter = ko.observable("");

    this.filteredLocationList = ko.dependentObservable(function() {
          var filter = this.filter().toLowerCase();
          if (!filter) {
            return ko.utils.arrayFilter(self.locationList(), function(location) {
            location.marker.setVisible(true);
            return true;
          });
          } else {
            return ko.utils.arrayFilter(this.locationList(), function(location) {
              if (location.title.toLowerCase().indexOf(filter) >= 0) {
              return true;
              } else {
                location.marker.setVisible(false);
              return false;
              }
            });
          }
        }, this);
  };



  // Data for marker
  var Place = function(data) {

    var self = this;
    self.title = data.title;
    self.lat = data.lat;
    self.lng = data.lng;
    self.wiki = data.wiki;
    self.url = ko.observable();

    // var for wiki API request
    var wikiUrl = 'https://ru.wikipedia.org/w/api.php?action=opensearch&search=' + this.wiki +'&format=json';

    // Start ajax
    $.ajax(wikiUrl,
      { dataType: "jsonp",
    }).done( function (data) {
      var articleList = data[1];
        articleStr = articleList[0];
        // Add a link to wikipedia
        var url = 'https://ru.wikipedia.org/wiki/'+ articleStr;
        self.url(url);

    }).fail(function () {
      alert('Data could not be retrieved from wiki.')
    });

    // Google Maps Marker for this location
    this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(this.lat, this.lng),
      map: map,
      title: this.title,
      animation: google.maps.Animation.DROP
    });
    this.marker.setMap(map);

  // content for infowindow
    this.contentString = ko.computed(function() {
            return  '<div class="marker-title">' + self.title + '</div>' +
                    '<div id="pano"></div>' +
                    '<div id="wiki"><a href="'+ self.url() + '"target="_blank">' +
                    'Open Wikipedia for more info</a></div>';
        });

    // clicking on a marker
    this.marker.addListener('click', function() {
          // Center clicked marker
          map.panTo(new google.maps.LatLng(self.lat, self.lng));
          // Content for infowindow
          infoWindow.setContent(self.contentString());
          // Open infowindow
          infoWindow.open(map, this);
          // Animate current marker
          self.locationAnimateClick();
          // Get panorama for current marker
          self.panoramaView();
      });

      // Connecting Click on list and open infoWindow for current marker
      this.clickOnList = function() {
          google.maps.event.trigger(self.marker, 'click');
      };

      //Animation for marker
      this.locationAnimateClick = function() {
        if (self.marker.getAnimation() !== null) {
          self.marker.setAnimation(null);
        } else {
          self.marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){ self.marker.setAnimation(null); }, 700);
        }
      };

      // Panorama for marker
      this.panoramaView = function(location) {
        // Adding streetView panorama
        var streetViewService = new google.maps.StreetViewService();
        var radius = 40;
        function getStreetView(data, status) {
          // Checking status of streetview
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, self.marker.position);
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
        streetViewService.getPanoramaByLocation(this.marker.position, radius, getStreetView);
      };
  };
  Mapping();
}


// If there is problems with Google maps API
function googleError() {
  window.alert("Sorry it's problem with Google Maps API");
}


// Open search and location list on screen max-width 700px
function openDrawer() {
  var menu = document.querySelector('#menu');
  var map = document.querySelector('#map');
  var drawer = document.querySelector('.drawer');
  var square = document.querySelector('.square');

  menu.addEventListener('click', function(e) {
    drawer.classList.toggle('open');
    e.stopPropagation();
  });
  map.addEventListener('click', function() {
    drawer.classList.remove('open');
  });
  square.addEventListener('click', function() {
    drawer.classList.remove('open');
  });
};
openDrawer();
