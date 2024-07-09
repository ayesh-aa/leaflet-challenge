// Create base layers
var streetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
  });
  
  var topoMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: "Map data: &copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, <a href=\"http://viewfinderpanoramas.org\">SRTM</a> | Map style: &copy; <a href=\"https://opentopomap.org\">OpenTopoMap</a> (<a href=\"https://creativecommons.org/licenses/by-sa/3.0/\">CC-BY-SA</a>)"
  });
  
  // Create a map object
  var myMap = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 5,
    layers: [streetMap, topoMap]
  });
  
  // Add the streetmap to the map
  streetMap.addTo(myMap);
  
  // Define the URL for the USGS GeoJSON data
  var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  
  // Perform a GET request to the query URL
  d3.json(queryUrl).then(function(data) {
    // Define a function to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
  
    // Define a function to create circle markers
    function pointToLayer(feature, latlng) {
      var color;
      var r = 255;
      var g = Math.floor(255-80*feature.geometry.coordinates[2]);
      var b = Math.floor(255-80*feature.geometry.coordinates[2]);
      color= "rgb("+r+" ,"+g+","+ b+")";
      
      var geojsonMarkerOptions = {
        radius: 4*feature.properties.mag,
        fillColor: color,
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(data, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer
    }).addTo(myMap);
  
    // Create a legend
    var legend = L.control({position: 'bottomright'});
  
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            depth = [-10, 10, 30, 50, 70, 90],
            labels = [];
  
        div.innerHTML += "<h4>Depth</h4>"
  
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(depth[i] + 1) + '"></i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
  
        return div;
    };
  
    legend.addTo(myMap);
  
    function getColor(d) {
        return d > 90 ? '#800026' :
               d > 70  ? '#BD0026' :
               d > 50  ? '#E31A1C' :
               d > 30  ? '#FC4E2A' :
               d > 10   ? '#FD8D3C' :
                          '#FEB24C';
    }
  
    // Tectonic Plates Data
    var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
    d3.json(tectonicPlatesUrl).then(function(tectonicData) {
      var tectonicPlates = L.geoJSON(tectonicData, {
        color: "orange",
        weight: 2
      }).addTo(myMap);
  
      // Define baseMaps object to hold base layers
      var baseMaps = {
        "Street Map": streetMap,
        "Topographic Map": topoMap
      };
  
      // Define overlayMaps object to hold overlay layers
      var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
      };
  
      // Create a layer control
      // Pass in baseMaps and overlayMaps
      // Add the layer control to the map
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);
    });
  });
  