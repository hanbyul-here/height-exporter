import { Unit } from './unit';
import { getNode } from './SVGUtil';

const scale = 37.79*2; // 2 cm

const boundingboxWidth = 72 * 24;
const boundingboxHeight = 72 * 18;

class Layer {
  constructor(data) {
    const heights = data.height_data;
    this.baseSVG = getNode('svg', {width: scale*heights.length ,height: scale* (heights[0].length-1)});

    this.units = [];
    let transferX = 0;

    for (let i = 0, j = heights.length-1; i < j; i++) {
      transferX = scale*10*i; // this is really arbitrary number
      for (let k = 0, l = heights[i].length-1; k < l; k++) {
        let transferY = scale*10*k;
        const heightScale = 1;
        const unit = new Unit({
          leftTop: heights[i][k]/heightScale,
          rightTop: heights[i][k+1]/heightScale,
          leftBottom: heights[i+1][k]/heightScale,
          rightBottom: heights[i+1][k+1]/heightScale,
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

    var wrapperRectangle = getNode('rect', {width: boundingboxWidth, height: boundingboxHeight, style: "stroke:blue;fill:none"});

    for(const unit of this.units) {
      unit.draw();
      this.baseSVG.appendChild(unit.getPathGroup());
    }
    this.baseSVG.appendChild(wrapperRectangle);
  }

  getSVGData () {
    return this.baseSVG;
  }

}

module.exports = { Layer };