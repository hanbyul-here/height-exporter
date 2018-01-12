import store from './redux/store'

let grid = store.getState()['grid'];
let distanceBetween;

// return double array
function getElevationCallUrls (startCoord, endCoord) {

  let elevationUrlsToFetch = [];

  const rightTop = {
    latitude: endCoord.latitude,
    longitude: startCoord.longitude
  }

  distanceBetween = getDistanceFromLatLonInKm(startCoord.latitude, startCoord.longitude, rightTop.latitude, rightTop.longitude)/(grid-1);

  const gap = (parseFloat(endCoord.longitude) - parseFloat(startCoord.longitude))/(grid-1);

  for (let i = 0; i < grid; i++) {
    let nextPoint = {latitude: startCoord.latitude, longitude: parseFloat(startCoord.longitude) + gap*i};
    let nextRightPoint = { latitude: endCoord.latitude, longitude: nextPoint.longitude};
    let thisUrl = buildURLWithShapes(getCoordArray(nextPoint, nextRightPoint));
    elevationUrlsToFetch.push(thisUrl);
  }

  return elevationUrlsToFetch;
}

function getCoordArray (startCoord, endCoord) {
  let returnArray = [];
  const gap = (parseFloat(endCoord.latitude) - parseFloat(startCoord.latitude))/(grid-1);
  for(let i = 0; i< grid; i++) {
    returnArray.push({
      lat: parseFloat(startCoord.latitude) + (gap*i),
      lon: startCoord.longitude
    })
  }
  return returnArray;
}


function buildURLWithShapes (shapeArray) {
  const serviceUrl = 'https://elevation.mapzen.com/';
  const apiKey = 'mapzen-cf31pKV';
  // var startLoc = converToLatLon(startCoord);
  // var endLoc = converToLatLon(endCoord);
  var params = JSON.stringify({
    shape : shapeArray
  });

  return serviceUrl + 'height?json=' + params + '&api_key=' + apiKey;
}


function converToLatLon (obj) {
  return {
    lat: obj.latitude,
    lon: obj.longitude
  };
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function postProcessHeightData (result) {
  //37.795275590551 pixel (X) is cm
  // we are going to make 2 cm unit
  let scale = 0.02/ (distanceBetween*1000);

  let flattenedArray = result['height_data'].reduce((prev, curr) => {return prev.concat(curr)}, []);
  let maxVal = Math.max.apply(null, flattenedArray);
  let minVal = Math.min.apply(null, flattenedArray);
  let offset = 72;//minVal/100;
  let exaggeration = 2;

  let newHeightValues = [];
  for (let i = 0; i < grid; i++) {
    let valRows = [];
    for(let j = 0; j < grid; j++) {
      const currentVal = result['height_data'][i][j];

      valRows.push(((currentVal-minVal) * 100 * scale * exaggeration* 37.79) + offset);
      // console.log((currentVal * scale * 72) - minArtNumber);
      //console.log(((currentVal/maxVal) * maxArtNumber)  )
    }
    newHeightValues.push(valRows);
  }
  return newHeightValues;
}

function getElevationValue (startCoord, endCoord) {
  let delayTime = 1000;

  let elevationUrlsToFetch = getElevationCallUrls(startCoord, endCoord);

  let result = {
    "height_data": []
  }

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
        result.height_data.push(values[0].height);
        return result;
      });
    })
  }, Promise.resolve())
  .then((result) => {
    return {
      "height_data": postProcessHeightData(result)
    }
  })
}



module.exports = { getElevationValue };