app.controller('MapCtrl', function($scope, $ionicLoading) {
 
    google.maps.event.addDomListener(window, 'load', function() {
      
        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();
        var markers = [];
        var currentLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        var myStyles = 
      [
        {
          "featureType": "poi",
          "stylers": [
            { "visibility": "off" }
          ]
        },
                {
          "featureType": "transit.station.rail",
          "elementType": "labels",
          "stylers": [
            { "visibility": "simplified" }
          ]
        }
      ];
        var mapOptions = {
            // zIndexBulle : 2,  // ici on surcharge pour utilisation
            infoWindow : false,
            center: currentLatlng,
            zoom: 15,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            // styles: myStyles 
        };
 
        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        // once the map is loaded
        fixInfoWindow(); 

        var centerMarker = new google.maps.Marker({
            position: currentLatlng,
            map: map,
            icon: 'img/home.png'
        });


        /* Dynamic center marker */
        var div = document.createElement('div');

        div.setAttribute('class', 'centerMarker');
        document.getElementById("map").appendChild(div);

        var request = {
          location: currentLatlng,
          radius: 300,
          types: ['bakery']
        };       
        var infoWindow = new google.maps.InfoWindow({
          noSupress: true, //<-- here we tell InfoWindow to bypass our blocker
          zIndex: 99999,
        });
        
        var service = new google.maps.places.PlacesService(map);

        service.nearbySearch(request, callback);

        /* Drag the Map 
          Temporary removed 
        */
        // google.maps.event.addListener(map, 'center_changed', function() {
        //   deleteMarkers();
        //   currentLatlng = map.getCenter();
        //   var request = {
        //     location: currentLatlng,
        //     radius: 300,
        //     types: ['bakery']
        //   };       
        //   var infoWindow = new google.maps.InfoWindow({
        //     noSupress: true //<-- here we tell InfoWindow to bypass our blocker
        //   });
          
        //   var service = new google.maps.places.PlacesService(map);

        //   service.nearbySearch(request, callback);

        // });

        $scope.loading.hide();

        function callback(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
              createMarker(results[i]);
            }
          }
        }

        function createMarker(place) {
          var placeLoc = place.geometry.location;
          var icon;
          var options = '';
          if (typeof place.opening_hours != "undefined" && typeof place.opening_hours.open_now != "undefined" && place.opening_hours.open_now == false) {
            icon = 'img/bread_off.png';
            options = ' <font color="#BF260B">Fermé <br /></font>';
          }
          else 
            icon = 'img/bread.png';
          var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: icon,
          });
          markers.push(marker);
          google.maps.event.addListener(marker, 'click', function() {
            var latLngA = currentLatlng;
            var latLngB = place.geometry.location;
            // if (typeof place.opening_hours != "undefined" ){
            //   try{
            //     open = place.opening_hours.periods[0].open.time;
            //     alert(open);
            //   }
            //   catch(e){
            //     open='No work time';
            //     alert(open);
            //   }
            // }
            var contentBakery =
                  '<b>' + place.name +'</b> <br />'+
                  options +
                  google.maps.geometry.spherical.computeDistanceBetween(latLngA, latLngB).toFixed(2) + ' m';
            // Remove all paths
            directionsDisplay.setMap();
            calcRoute(latLngA, latLngB);
            infoWindow.setContent(contentBakery);           
            // infoWindow.setZIndex(99999);
            infoWindow.open(marker.get('map'), marker, true);
          });
        }

         function setAllMap(map) {
          for (var i = 0; i < markers.length; i++) {
            // google.maps.event.clearListeners(markers[i], 'click');
            // markers[i].setVisible(false);
            markers[i].setMap(map);
          }
        }
        // Removes the markers from the map, but keeps them in the array.
        function clearMarkers() {
          setAllMap(null);
        }
        // Deletes all markers in the array by removing references to them.
        function deleteMarkers() {
          clearMarkers();
          markers = [];
        }
        
        //Magic fix:
        function fixInfoWindow() {
            //Here we redefine set() method.
            //If it is called for map option, we hide InfoWindow, if "noSupress" option isnt true.
            //As Google doesn't know about this option, its InfoWindows will not be opened.
            var set = google.maps.InfoWindow.prototype.set;
            google.maps.InfoWindow.prototype.set = function (key, val) {
                if (key === 'map') {
                    if (!this.get('noSupress')) {
                        console.log('This InfoWindow is supressed. To enable it, set "noSupress" option to true');
                        return;
                    }
                }
                set.apply(this, arguments);
            }
        }

        function calcRoute(latLngA, latLngB) {
          directionsDisplay.setMap(map);
          var start = latLngA;
          var end = latLngB;
          var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.WALKING
          };
          directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
              directionsDisplay.setMap(map);
              directionsDisplay.setOptions( { suppressMarkers: true } );
              directionsDisplay.setOptions( { preserveViewport: true } );
            }
            else {
              alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
            }
          });
        }

        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });

      });

});