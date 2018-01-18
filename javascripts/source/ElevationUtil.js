import store from './redux/store'

import { receiveHeightData, receiveProcessedHeightData } from './redux/actions'

let distanceBetween;

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


function getElevationCallUrls () {

  let startCoord = store.getState()['requestParameter']['startCoordinates']
  let endCoord = store.getState()['requestParameter']['endCoordinates']
  let gridPointsNumber = store.getState()['requestParameter']['gridPointsNumber'];

  let elevationUrlsToFetch = [];

  console.log(store.getState()['requestParameter']['endCoordinates'])
  let rightTop = {
    lat: endCoord.lat,
    lng: startCoord.lng
  }

  distanceBetween = getDistanceFromLatLonInKm(startCoord.lat, startCoord.lng, rightTop.lat, rightTop.lng)/(gridPointsNumber-1);
  let gap = (endCoord.lng - startCoord.lng)/(gridPointsNumber-1);

  for (let i = 0; i < gridPointsNumber; i++) {
    let nextPoint = {lat: startCoord.lat, lng: parseFloat(startCoord.lng) + gap*i};
    let nextRightPoint = {lat: endCoord.lat, lng: nextPoint.lng};
    let thisUrl = buildURLWithShapes(getCoordArray(nextPoint, nextRightPoint));
    elevationUrlsToFetch.push(thisUrl);
  }

  return elevationUrlsToFetch;
}

function getCoordArray (start, end) {
  let returnArray = [];
  let gridPointsNumber = store.getState()['requestParameter']['gridPointsNumber'];
  let gap = (parseFloat(end.lat) - parseFloat(start.lat))/(gridPointsNumber-1);
  for(let i = 0; i< gridPointsNumber; i++) {
    returnArray.push({
      lat: parseFloat(start.lat) + (gap*i),
      lon: start.lng
    })
  }
  return returnArray;
}


function buildURLWithShapes (shapeArray) {
  const serviceUrl = 'https://elevation.mapzen.com/';
  const apiKey = 'mapzen-cf31pKV';
  var params = JSON.stringify({
    shape : shapeArray
  });

  return serviceUrl + 'height?json=' + params + '&api_key=' + apiKey;
}



function postProcessHeightData () {

  let unitSize = store.getState()['layout']['oneUnitSizeInInch'];
  let inchToPixel = store.getState()['layout']['inchToPixel'];
  let gridPointsNumber = store.getState()['requestParameter']['gridPointsNumber'];
  // 1 in == 2.54 cm. pixel => inch => cm => m

  let scale =  (unitSize/inchToPixel *2.54 * 0.01) / (distanceBetween*1000); // scale in meter

  let heightData = store.getState()['heightData']['rawData']
  let offset = store.getState()['layout']['offset']
  let minVal = store.getState()['heightData']['minVal']
  let maxVal = store.getState()['heightData']['maxVal']
  let exaggeration = store.getState()['layout']['exaggeration']

  let newHeightValues = [];

  function scaleDownHeight(val) {
    // m => cm => pixel with exaggeration
    return ((val-minVal) * scale * 100 * 37.79 * exaggeration) + offset
  }

  for (let i = 0; i < gridPointsNumber; i++) {
    let valRows = [];
    for(let j = 0; j < gridPointsNumber; j++) {
      let currentVal = heightData[i][j];
      valRows.push(scaleDownHeight(currentVal));
    }
    newHeightValues.push(valRows);
  }
  store.dispatch(receiveProcessedHeightData(newHeightValues))
  return newHeightValues;
}

function getElevationValue () {
  let delayTime = 1000;

  let elevationUrlsToFetch = getElevationCallUrls();

  let result =  []

  let getEachCall = (url) =>
    new Promise((resolve, reject) => {
      console.log(url);
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = () => resolve(JSON.parse(xhr.responseText));
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    });

  let delay = ms => new Promise(resolve => setTimeout(resolve, ms, 'dumb'));
  return elevationUrlsToFetch.reduce(function(promise, item, index, array) {
    return promise.then(values => {
      // Second promise was just to delay
      return Promise.all([getEachCall(item), delay(delayTime)]).then((values)=> {
        result.push(values[0].height);
        return result;
      });
    })
  }, Promise.resolve())
  .then(() => {
    store.dispatch(receiveHeightData(result))
    postProcessHeightData();
  })
}

module.exports = { getElevationValue };