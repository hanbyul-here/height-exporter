import { getElevationValue } from './ElevationUtil';
import { Layer } from './Layer';

import { setScene } from './Preview';

(function (root, factory) {
  // Universal Module Definition (UMD)
  // via https://github.com/umdjs/umd/blob/master/templates/returnExports.js
  if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(this, function () {
// initialize map
  L.Mapzen.apiKey = 'search-waNZobx';
  var map = L.Mapzen.map('map', {
    tangramOptions: {
      scene: L.Mapzen.BasemapStyles.Walkabout
    },
    scrollZoom: false,
    minZoom: 2})
  .setView([46.2332, -122.1845], 14);

  L.Mapzen.hash({
    map: map
  })

  L.Mapzen.geocoder().addTo(map);

  var areaSelect = L.areaSelect({width:300, height:300});

  areaSelect.on("change", function() {
    var bounds = this.getBounds();

    document.getElementById('startLat').value = bounds.getNorthEast().lat.toFixed(4);
    document.getElementById('startLon').value = bounds.getNorthEast().lng.toFixed(4);

    document.getElementById('endLat').value = bounds.getSouthWest().lat.toFixed(4);
    document.getElementById('endLon').value = bounds.getSouthWest().lng.toFixed(4);
  });

  areaSelect.addTo(map);

  var requestTileButton = document.getElementById('requestTiles');
  var warningBox = document.getElementById('api-key-warning');
  var statusBox = document.getElementById('status');

  requestTileButton.addEventListener('click', function (e) {
    // loading static data while in development
    // const xhr = new XMLHttpRequest();
    // xhr.open("GET", '/javascripts/sample/sample-data-fuji.json');
    // xhr.onload = () => {
    //   var data = JSON.parse(xhr.responseText);
    //   console.log(data);
    //   var layer = new Layer(data[0]);
    //   var svgdata = layer.getSVGData();
    //   enableDownloadLink(svgdata);
    // }
    // xhr.onerror = () => console.log('error')
    // xhr.send();


    var startCoord = {
      latitude: document.getElementById('startLat').value,
      longitude: document.getElementById('startLon').value
    };
    var endCoord = {
      latitude: document.getElementById('endLat').value,
      longitude: document.getElementById('endLon').value
    }

    getElevationValue(startCoord, endCoord).then( (result) => {
      console.log(result);
      var preview = setScene(result.height_data);
      var layer = new Layer(result);
      var svgdata = layer.getSVGData();
      enableDownloadLink(svgdata);
    })


  });


  function enableDownloadLink (svg) {
    let downloadA = document.getElementById('downloadSVG');
    downloadA.download = 'requested-map.svg';
    var markup = (new XMLSerializer()).serializeToString(svg);
    const blob = new Blob([markup], {type: 'text/xml'});
    const url = URL.createObjectURL(blob);
    downloadA.href = url;
  }

  return {};
}));
