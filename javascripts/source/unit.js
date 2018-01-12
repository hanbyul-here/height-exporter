import { getNode } from './SVGUtil';
var vectorizeText = require("vectorize-text");
const PVector = require('pvectorjs');

class Unit {
  constructor(info) {
    this.scale = info.scale;
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

    const leftTop = this.heightInfo.leftTop; // [0]
    const leftBottom = this.heightInfo.leftBottom; // [1]
    const rightBottom = this.heightInfo.rightBottom; // [2]
    const rightTop = this.heightInfo.rightTop; //[3]

    this.topCore = new PVector(
              (scale*4 + Math.cos((3*Math.PI/2) - baseAngle - bottomAngle) * coreDist),
              (leftTop.z + Math.sin((3*Math.PI/2) - baseAngle - bottomAngle) * coreDist) );

    this.topNext = new PVector(
            (scale*4 + Math.cos((3*Math.PI/2) - baseAngle - bottomAngle - topAngle) * topDist),
            (leftTop.z + Math.sin((3*Math.PI/2) - baseAngle - bottomAngle - topAngle)* topDist));

    const distBtw34 = this.distance(this.top3,this.top4);

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
    this.wings[1].add(this.top3);

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

    const flapScale = this.scale/4;

    this.flaps = new Array(8);
    this.flaps[0] = new PVector.sub(this.wings[2], this.topNext);
    this.flaps[0].norm();
    this.flaps[0].rotateBy(-Math.PI/8);
    this.flaps[0].mult(flapScale*2);
    this.flaps[0].add(this.topNext);

    this.flaps[1] = new PVector.sub(this.wings[2], this.topNext);
    this.flaps[1].norm();
    this.flaps[1].rotateBy(-7*Math.PI/8);
    this.flaps[1].mult(flapScale*2);
    this.flaps[1].add(this.wings[2]);

    this.flaps[2] = new PVector.sub(this.wings[3], this.topCore);
    this.flaps[2].norm();
    this.flaps[2].rotateBy(Math.PI/8);
    this.flaps[2].mult(flapScale*2);
    this.flaps[2].add(this.topCore);

    this.flaps[3] = PVector.sub(this.wings[3], this.topCore);
    this.flaps[3].norm();
    this.flaps[3].rotateBy(7*Math.PI/8);
    this.flaps[3].mult(flapScale*2);
    this.flaps[3].add(this.wings[3]);

    // TO DO: Do this in right way
    this.flaps[4] = new PVector(this.top3.x - flapScale, flapScale);
    this.flaps[5] = new PVector(this.top3.x - flapScale, this.top3.y - flapScale);

    this.flaps[6] = new PVector(this.top4.x + flapScale, flapScale);
    this.flaps[7] = new PVector(this.top4.x + flapScale, this.top4.y - flapScale);

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

  writeNumber (v) {
    // Gotta write number in polygon
    let polygons = vectorizeText(`${this.xIndex} - ${this.yIndex}`, {
      polygons: true,
      width: this.scale*0.5,
      height: this.scale*0.2,
      textBaseline: "hanging"
    })

    let numberPolygon = [];
    let offsetx = this.scale*3.15;
    let offsety = -this.scale*0.3;

    polygons.forEach(function(loops) {
      //numberPolygon.push('<path d="')
      loops.forEach(function(loop) {
        var start = loop[0]
        numberPolygon.push('M ' + (start[0]+offsetx) + ' ' + (start[1]+offsety))
        for(var i=1; i<loop.length; ++i) {
          var p = loop[i]
          numberPolygon.push('L ' + (p[0]+offsetx) + ' ' + (p[1]+offsety))
        }
        numberPolygon.push('L ' + (start[0]+offsetx) + ' ' + (start[1]+offsety))
      })
    })
    let numberPolygonToAttch = getNode('path', {d:numberPolygon.join(' '), style: "stroke:black;fill:none", 'transform': `rotate(180 ${v.x + this.scale/4} 3)`})

    this.pathGroup.appendChild(numberPolygonToAttch);
  }



  drawPolygon () {
    let e = function (v) {
        return ` ${v.x},${v.y}`;
    }

    let ps = [];

    ps.push(e(this.topNext));
    ps.push(e(this.flaps[0]));
    ps.push(e(this.flaps[1]));

    ps.push(e(this.wings[2]));

    ps.push(e(this.wings[3]));
    ps.push(e(this.flaps[3]));
    ps.push(e(this.flaps[2]));
    ps.push(e(this.topCore));


    ps.push(e(this.wings[0]));
    ps.push(e(this.wings[1]));


    ps.push(e(this.top3));
    ps.push(e(this.flaps[5]));
    ps.push(e(this.flaps[4]));
    ps.push(e(new PVector(this.scale*3, 0)));


    ps.push(e(new PVector(this.scale*4, 0)));
    ps.push(e(this.flaps[6]));
    ps.push(e(this.flaps[7]));
    ps.push(e(this.top4));


    ps.push(e(this.wings[4]));
    ps.push(e(this.wings[5]));

    var polygonNode = getNode('polygon', {points: ps.join(' '), style: "stroke:purple;fill:none" , rel: `${this.xIndex}-${this.yIndex}` });
    this.pathGroup.appendChild(polygonNode);
  }

  draw () {
    this.unfold();
    this.unfoldWide();
    this.writeNumber(new PVector(this.scale*3.2, this.scale*0.5));
    this.drawPolygon();
  }


  getPathGroup () {
    return this.pathGroup;
  }

}

module.exports = { Unit }