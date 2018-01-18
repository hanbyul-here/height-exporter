/* reducer */
import { combineReducers } from 'redux';

const layoutState = {
  oneUnitSizeInInch: 1,
  inchToPixel: 72,
  cmToPixel: 37.79,
  flapScale: 30,
  offset: 36,
  exaggeration: 120,
  materialThickness: 1
}

const requestParameterInitialstate = {
  startCoordinates: null,
  endCoordinates: null,
  gridPointsNumber: 10+1
}

const requestedHeightsState = {
  rawData: [],
  processedData: [],
  minVal: 0,
  maxVal: 0
}

function layout (state = layoutState, action) {
  switch (action.type) {
    case 'CHANGE-UNIT-SIZE-IN-INCH':
      return {
        ...state,
        oneUnitSizeInInch: action.oneUnitSizeInInch,
        flapScale: (action.oneUnitSize)*state.inchToPixel/3
      }
    default:
      return state;
  }
}

function requestParameter (state = requestParameterInitialstate, action) {
  switch (action.type) {
    case 'CHANGE-GRID-POINTS-NUMBER':
     return {
        ...state,
        gridPointsNumber: action.gridPointsNumber
     }
     case 'CHANGE-COORDINATES':
      return {
        ...state,
        startCoordinates: action.startCoordinates,
        endCoordinates: action.endCoordinates
      }
    default:
      return state
  }
}

function heightData (state = requestedHeightsState, action) {
  switch (action.type) {
    case 'RECEIVE_RAW_HEIGHTS':
      return {
        ...state,
        rawData: action.rawData,
        minVal: action.minVal,
        maxVal: action.maxVal
      }
    case 'RECEIVE_PROCESSED_HEIGHTS':
      return {
        ...state,
        processedData: action.processedData
      }

    default:
      return state
  }
}


export default combineReducers({
  layout,
  requestParameter,
  heightData
})