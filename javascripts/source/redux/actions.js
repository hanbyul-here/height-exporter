export function setGridNumber(number) {
  return {
    type: 'CHANGE-GRID-NUMBER',
    grid: number
  }
}

export function setScale(scale) {
  return {
    type: 'CHANGE-SCALE',
    scale: scale
  }
}