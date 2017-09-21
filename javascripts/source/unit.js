import { SVGPathHelper } from './SVGPathHelper';
import { getNode } from './SVGUtil';
const PVector = require('pvectorjs');

class Unit {
  constructor(info) {
    this.scale = info.scale/10;
    this.heightInfo = {
      leftTop: new PVector(0, this.scale, info.leftTop),
      rightTop: new PVector(this.scale, this.scale, info.rightTop),
      leftBottom: new PVector(0, 0, info.leftBottom),
      rightBottom: new PVector(this.scale, 0, info.rightBottom),
    }
    this.xIndex = info.xIndex;
    this.yIndex = info.yIndex;
    // This is thest value
    this.pathGroup = getNode('g', {transform: `translate(${info.transferX} ${info.transferY})`});
  }
  // Is this true pvector doesn't offer 3d vector distance
  distance (vec1, vec2) {
    if (vec1.z && vec2.z) {
      var dx = vec1.x - vec2.x;
      var dy = vec1.y - vec2.y;
      var dz = vec1.z - vec2.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    if (vec1.y && vec2.y) {
      var dx = vec1.x - vec2.x;
      var dy = vec1.y - vec2.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    return NaN;
  }

  unfoldWide() {

    const scale = this.scale;
    const baseAngle = this.baseAngle;
    const bottomAngle = this.bottomAngle;
    const topAngle = this.topAngle;

    const coreDist = this.coreDist;
    const topDist = this.topDist;

    const leftBottom = this.heightInfo.leftBottom; // [1]
    const rightBottom = this.heightInfo.rightBottom; // [2]
    const leftTop = this.heightInfo.leftTop; // [0]
    const rightTop = this.heightInfo.rightTop; //[3]

    this.topCore = new PVector(
              (scale*4 + Math.cos((3*Math.PI/2) - baseAngle - bottomAngle) * coreDist),
              (leftTop.z + Math.sin((3*Math.PI/2) - baseAngle - bottomAngle) * coreDist) );

    this.topNext = new PVector(
            (scale*4 + Math.cos((3*Math.PI/2) - baseAngle - bottomAngle - topAngle) * topDist),
            (leftTop.z + Math.sin((3*Math.PI/2) - baseAngle - bottomAngle - topAngle)* topDist));


    this.tempTop3 = new PVector(scale*3, rightTop.z);

    this.tempTop4 = new PVector(scale*4, leftTop.z);
//
    const distBtw34 = this.distance(this.tempTop3,this.tempTop4);


    this.wings = new Array(6);

    const distBtwnNC = this.distance(this.topCore, this.topNext);

    this.wings[0] = new PVector.sub(this.topCore, this.top3);
    this.wings[0].norm();
    this.wings[0].rotateBy(Math.PI - this.angle3);
    this.wings[0].mult(rightBottom.z);
    this.wings[0].add(this.topCore);

    this.wings[1] = new PVector.sub(this.topCore, this.top3);
    this.wings[1].norm();
    this.wings[1].rotateBy(Math.PI - this.angle3);
    this.wings[1].mult(rightTop.z);
    this.wings[1].add(this.tempTop3);

    this.wings[2] = new PVector.sub(this.topNext, this.topCore);
    this.wings[2].norm();
    this.wings[2].rotateBy(Math.PI - this.angle2);
    this.wings[2].mult(leftBottom.z);
    this.wings[2].add(this.topNext);


    this.wings[3] = new PVector.sub(this.topNext, this.topCore);
    this.wings[3].norm();
    this.wings[3].rotateBy(Math.PI - this.angle2);
    this.wings[3].mult(rightBottom.z);
    this.wings[3].add(this.topCore);

    this.wings[4] = new PVector.sub(this.topNext, this.top4);
    this.wings[4].norm();
    this.wings[4].rotateBy(-this.angle1);
    this.wings[4].mult(leftTop.z);
    this.wings[4].add(this.top4);


    this.wings[5] = PVector.sub(this.topNext, this.top4);
    this.wings[5].norm();
    this.wings[5].rotateBy(-this.angle1);
    this.wings[5].mult(leftBottom.z);
    this.wings[5].add(this.topNext);


  }


  unfold () {
    const leftBottom = this.heightInfo.leftBottom;// [1]
    const rightBottom = this.heightInfo.rightBottom;// [2]
    const leftTop = this.heightInfo.leftTop;// [0]
    const rightTop = this.heightInfo.rightTop;//[3]


    this.top0 = new PVector(this.scale *0, leftTop.z);
    this.top1 = new PVector(this.scale *1, leftBottom.z);
    this.top2 = new PVector(this.scale *2, rightBottom.z);
    this.top3 = new PVector(this.scale *3, rightTop.z);
    this.top4 = new PVector(this.scale *4, leftTop.z);

    const bottom4 = new PVector(this.scale *4, 0);

    this.baseAngle = PVector.angleBetween(PVector.sub(bottom4, this.top4), PVector.sub(this.top3, this.top4));

    // Get top part's math

    this.topV = PVector.sub(leftBottom, leftTop);
    this.coreV = PVector.sub(rightBottom, leftTop);
    this.bottomV = PVector.sub(rightTop, leftTop);

    const topV = this.topV;
    const coreV = this.coreV;
    const bottomV = this.bottomV;

    this.topAngle = PVector.angleBetween(topV,coreV);
    this.bottomAngle = PVector.angleBetween(coreV,bottomV);

    this.topDist = this.distance(leftBottom, leftTop);
    this.coreDist = this.distance(rightBottom, leftTop);
    this.bottomDist = this.distance(rightTop, leftTop);

    const downVector = new PVector(0, -1);

    const pv1 = PVector.sub(this.top1, this.top0);
    pv1.norm();
    this.angle1 = PVector.angleBetween(pv1, downVector);


    const pv2 = PVector.sub(this.top2, this.top1);
    pv2.norm();
    this.angle2 = PVector.angleBetween(pv2, downVector);

    const pv3 = PVector.sub(this.top3, this.top2);
    pv3.norm();
    this.angle3 = PVector.angleBetween(pv3, downVector);
  }

  draw () {
    this.unfold();
    this.unfoldWide();

    const path1 = new SVGPathHelper();

    path1.moveTo(this.tempTop3);
    path1.lineTo(this.topCore);
    path1.lineTo(this.topNext);
    path1.lineTo(this.tempTop4);
    path1.lineTo(this.tempTop3);

    path1.moveTo(this.topCore);
    path1.lineTo(this.tempTop4);

    path1.moveTo(new PVector(this.scale*3, 0));
    path1.lineTo(this.top3);
    path1.lineTo(this.top4);
    path1.lineTo(new PVector(this.scale*4, 0));
    path1.lineTo(new PVector(this.scale*3, 0));


    path1.moveTo(this.topCore);
    path1.lineTo(this.wings[0]);
    path1.lineTo(this.wings[1]);
    path1.lineTo(this.top3);
    path1.lineTo(this.topCore);


    path1.moveTo(this.topNext);
    path1.lineTo(this.wings[2])
    path1.lineTo(this.wings[3]);
    path1.lineTo(this.topCore);
    path1.lineTo(this.topNext);

    path1.moveTo(this.tempTop4);
    path1.lineTo(this.wings[4]);
    path1.lineTo(this.wings[5]);
    path1.lineTo(this.topNext);
    path1.lineTo(this.tempTop4);

    // path1.lineTo(new PVector(0, this.heightInfoRightTop));
    path1.close();

    const pathNode = path1.getPathNode();
    this.pathGroup.appendChild(pathNode);
  }

  getPathGroup () {
    return this.pathGroup;
  }

}

module.exports = { Unit }