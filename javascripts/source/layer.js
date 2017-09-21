import { Unit } from './unit';
import { getNode } from './SVGUtil';


class Layer {
  constructor(data) {
    const heights = data.height_data;
    const scale = data.distance;

    this.baseSVG = getNode('svg');

    this.units = [];
    let transferX = 0;
    let transferY = 0;
    for (let i = 0, j = heights.length-1; i < j; i++) {
      transferX += scale;
      for (let k = 0, l = heights[i].length-1; k < l; k++) {
        transferY += (heights[i][k]);
        const heightScale = 2;
        const unit = new Unit({
          leftTop: heights[i][k]/heightScale,
          rightTop: heights[i][k+1]/heightScale,
          leftBottom: heights[i+1][k]/heightScale,
          rightBottom: heights[i+1][k+1]/heightScale,
          scale: scale,
          xIndex: i,
          yIndex: k,
          transferX: transferX,
          transferY: transferY,
        });
        this.units.push(unit);
      }
    }

    let groups = [];
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