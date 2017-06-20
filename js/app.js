
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:56.821933, lng:60.621233},
    zoom: 12
  });
  var home = {lat:56.795078, lng:60.626426};
  var marker = new google.maps.Marker({
    position: home,
    map: map,
    title: 'First marker'
  });
  var infoWindow = new google.maps.InfoWindow({
    content: 'Hello there!'
  });
  marker.addListener('click', function(){
    infoWindow.open(map, marker);
  });
}
