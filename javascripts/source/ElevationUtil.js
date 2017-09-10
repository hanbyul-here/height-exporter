import { getDistance, computeDestinationPoint } from 'geolib';


const grid = 3;
const delayTime = 500;

// return double array
const getElevationCallUrls = function (startCoord, endCoord) {
  console.log('running')
  let elevationUrlsToFetch = [];

  const rightTop = {
    latitude: endCoord.latitude,
    longitude: startCoord.longitude
  }

  const horizontalDistance = getDistance(startCoord, rightTop);

  const samplingDistance = (horizontalDistance/grid).toFixed(5);
  const url = buildURL(startCoord, rightTop, samplingDistance);
  elevationUrlsToFetch.push(url);

  for (let i = 0; i < grid; i++) {
    const nextPoint = computeDestinationPoint(startCoord, samplingDistance * (i+1), 90);
    const nextRightPoint = { latitude: endCoord.latitude, longitude: nextPoint.longitude};
    const thisUrl = buildURL(nextPoint, nextRightPoint, samplingDistance);
    elevationUrlsToFetch.push(thisUrl);
  }

  return elevationUrlsToFetch;
}


const buildURL = function (startCoord, endCoord, samplingDistance) {
  const serviceUrl = 'https://elevation.mapzen.com/';
  const apiKey = 'mapzen-cf31pKV';
  var startLoc = converToLatLon(startCoord);
  var endLoc = converToLatLon(endCoord);
  var params = JSON.stringify({
    shape : [startLoc, endLoc],
    // range : true,
    resample_distance : samplingDistance
  });

  return serviceUrl + 'height?json=' + params + '&api_key=' + apiKey;
}

const converToLatLon = function (obj) {
  return {
    lat: obj.latitude,
    lon: obj.longitude
  };
}

const getElevationValue = function (startCoord, endCoord) {
  const elevationUrlsToFetch = getElevationCallUrls(startCoord, endCoord);
  let jsonArray = [];

  const getEachCall = (url) =>
    new Promise((resolve, reject) => {
      console.log(url);
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = () => resolve(JSON.parse(xhr.responseText));
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    });

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms, 'dumb'));
  
  return elevationUrlsToFetch.reduce(function(promise, item, index, array) {
    return promise.then(values => {
      // Second promise was just to delay
      return Promise.all([getEachCall(item), delay(delayTime)]).then((values)=> {
        jsonArray.push(values[0].height);
        return jsonArray;
      });
    })
  }, Promise.resolve());
}



module.exports = { getElevationValue };