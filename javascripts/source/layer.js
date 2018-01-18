import { Unit } from './unit';
import { getNode } from './SVGUtil';
import store from './redux/store'

const boundingboxWidth = 72 * 24;
const boundingboxHeight = 72 * 18;

class Layer {

  constructor() {

    let scale  = store.getState()['layout']['oneUnitSizeInInch'] * store.getState()['layout']['inchToPixel'];
    let heights = store.getState()['heightData']['processedData']
    console.log(heights)

    this.baseSVG = getNode('svg', {width: scale*heights.length ,height: scale* (heights[0].length-1)});

    this.units = [];
    let transferX = 0;

    for (let i = 0, j = heights.length-1; i < j; i++) {
      transferX = scale*13*i; // this is really arbitrary number
      for (let k = 0, l = heights[i].length-1; k < l; k++) {
        let transferY = scale*13*k;

        const unit = new Unit({
          leftTop: heights[i][k],
          rightTop: heights[i][k+1],
          leftBottom: heights[i+1][k],
          rightBottom: heights[i+1][k+1],
          scale: scale,
          xIndex: i,
          yIndex: k,
          transferX: transferX,
          transferY: transferY
        });
        transferY += (heights[i][k]);
        this.units.push(unit);
      }
    }

    let wrapperRectangle = getNode('rect', {width: boundingboxWidth, height: boundingboxHeight, style: "stroke:blue;fill:none"});

    for(let unit of this.units) {
      unit.draw();
      this.baseSVG.appendChild(unit.getPathGroup());
    }
    this.baseSVG.appendChild(wrapperRectangle);
  }

  getSVGData () {
    return this.baseSVG;
  }

}

export default Layer;