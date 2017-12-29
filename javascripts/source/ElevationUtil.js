import { Unit } from './unit';

const grid = 10;
const delayTime = 1000;

// return double array
const getElevationCallUrls = function (startCoord, endCoord) {

  let elevationUrlsToFetch = [];

  const rightTop = {
    latitude: endCoord.latitude,
    longitude: startCoord.longitude
  }

  const gap = (parseFloat(endCoord.longitude) - parseFloat(startCoord.longitude))/(grid-1);

  for (let i = 0; i < grid; i++) {
    const nextPoint = {latitude: startCoord.latitude, longitude: parseFloat(startCoord.longitude) + gap*i};
    console.log(nextPoint)
    const nextRightPoint = { latitude: endCoord.latitude, longitude: nextPoint.longitude};
    const thisUrl = buildURLWithShapes(getCoordArray(nextPoint, nextRightPoint));
    elevationUrlsToFetch.push(thisUrl);
  }

  return elevationUrlsToFetch;
}

const getCoordArray = function (startCoord, endCoord) {
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


const buildURLWithShapes = function (shapeArray) {
  const serviceUrl = 'https://elevation.mapzen.com/';
  const apiKey = 'mapzen-cf31pKV';
  // var startLoc = converToLatLon(startCoord);
  // var endLoc = converToLatLon(endCoord);
  var params = JSON.stringify({
    shape : shapeArray
  });

  return serviceUrl + 'height?json=' + params + '&api_key=' + apiKey;
}


const converToLatLon = function (obj) {
  return {
    lat: obj.latitude,
    lon: obj.longitude
  };
}

const getProcessedNumber = function(val) {

}

const getElevationValue = function (startCoord, endCoord) {
  const elevationUrlsToFetch = getElevationCallUrls(startCoord, endCoord);
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
  console.log(elevationUrlsToFetch);
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
    const flattenedArray = result['height_data'].reduce((prev, curr) => {return prev.concat(curr)}, []);
    const maxVal = Math.max.apply(null, flattenedArray);
    const minVal = Math.min.apply(null, flattenedArray);
    const offset = 20;
    const maxArtNumber = 80;
    let newHeightValues = [];
    for (var i = 0; i < grid; i++) {
      let valRows = [];
      for(var j = 0; j < grid; j++) {
        const currentVal = result['height_data'][i][j];
        newHeightValues.push( ((currentVal/maxVal) * maxArtNumber) + offset);
      }
    }

    return {
      "height_data": newHeightValues
    }
  })
}



module.exports = { getElevationValue };