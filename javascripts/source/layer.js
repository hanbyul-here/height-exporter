import { Unit } from './unit';
import { getNode } from './SVGUtil';


class Layer {
  constructor(data) {
    const heights = data.height_data;
    const scale = data.distance/20;

    this.baseSVG = getNode('svg');

    this.units = [];
    let transferX = 0;
    let transferY = -100;
    for (let i = 0, j = heights.length-1; i < j; i++) {
      transferX = scale*5*i; // this is really arbitrary number
      transferY = -100;
      for (let k = 0, l = heights[i].length-1; k < l; k++) {
        const heightScale = 4;
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

    for(const unit of this.units) {
      unit.draw();
      this.baseSVG.appendChild(unit.getPathGroup());
    }
  }

  getSVGData () {
    return this.baseSVG;
  }

}

module.exports = { Layer };