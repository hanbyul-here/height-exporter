/* reducer */

const initialState = {
  grid: 12,
  scale: 0.1,
  // 72px is one inc
  // we are going to make 1 inc
  unit: 72,
  offset: 72
}

function reducer (state = initialState, action) {
  switch(action.type) {
    case 'CHANGE-GRID-NUMBER':
     return Object.assign({}, state, {
        grid: action.grid
      })
    case 'CHANGE-SCALE':
     return Object.assign({}, state, {
        scale: action.scale
      })
    default:
      return state
  }
}

export default reducer;