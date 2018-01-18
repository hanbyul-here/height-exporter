function getMinMaxVal(doubleArray) {
  let flattenedArray = doubleArray.reduce((prev, curr) => {return prev.concat(curr)}, []);
  return {
    max: Math.max.apply(null, flattenedArray),
    min: Math.min.apply(null, flattenedArray)
  }
}

export function changeUnitSize (newUnitSize) {
  return {
    type: 'CHANGE-UNIT-SIZE',
    oneUnitSize: newUnitSize
  }
}

export function receiveHeightData (rawHeightData) {
  let minMax = getMinMaxVal(rawHeightData);
  return {
    type: 'RECEIVE_RAW_HEIGHTS',
    rawData: rawHeightData,
    maxVal: minMax.max,
    minVal: minMax.min
  }
}

export function receiveProcessedHeightData (processedHeightData) {
  return {
    type: 'RECEIVE_PROCESSED_HEIGHTS',
    processedData: processedHeightData
  }
}


export function changeGridPointsNumber (number) {
  return {
    type: 'CHANGE-GRID-POINTS-NUMBER',
    gridPointsNumber: number
  }
}

export function changeCoordinates (bbox) {
  return {
    type: 'CHANGE-COORDINATES',
    startCoordinates: bbox.getNorthEast(),
    endCoordinates: bbox.getSouthWest()
  }
}