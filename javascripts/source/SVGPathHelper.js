import { getNode } from './SVGUtil';
import PVector from 'pvectorjs';

class SVGPathHelper {
  constructor() {
    this.pathData = '';
  }

  moveTo(vector) {
    this.pathData += `M${vector.x} ${vector.y}`;
  }

  lineTo(vector) {
    this.pathData += ` L${vector.x} ${vector.y}`;
  }

  close() {
    this.pathData += ' z';
  }

  getPathNode () {
    const pathNode = getNode('path', {d: `${this.pathData}` });
    return pathNode;
  }
}



module.exports = { SVGPathHelper };