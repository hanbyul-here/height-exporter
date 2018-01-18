import { getNode } from './SVGUtil';
const vectorizeText = require("vectorize-text");
const PVector = require('pvectorjs');

class Unit {
  constructor(info) {
    this.scale = info.scale;
    this.material = 1;
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

  applyMaterialThickness() {
    /* paper has thickness which increases cube's width when assembled */
    var t3 = new PVector(0,0).set(this.top3);
    var t4 = new PVector(0,0).set(this.top4);

    var tc = new PVector(0,0).set(this.topCore);
    var tn = new PVector(0,0).set(this.topNext);

    this.top3.lerp(t4, this.material/this.scale);
    this.top4.lerp(t3, this.material/this.scale);

    this.topCore.lerp(tn, this.material/this.scale);
    this.topNext.lerp(tc, this.material/this.scale);
  }

  getInterpolatedHeight(valA, valB, percentage) {
    return valA + ((valB - valA) *percentage);
  }

  unfoldWide() {

    let scale = this.scale;
    let baseAngle = this.baseAngle;
    let bottomAngle = this.bottomAngle;
    let topAngle = this.topAngle;

    let coreDist = this.coreDist;
    let topDist = this.topDist;

    let leftTop = this.heightInfo.leftTop; // [0]
    let leftBottom = this.heightInfo.leftBottom; // [1]
    let rightBottom = this.heightInfo.rightBottom; // [2]
    let rightTop = this.heightInfo.rightTop; //[3]

    this.topCore = new PVector(
              (scale*4 + Math.cos((3*Math.PI/2) - baseAngle - bottomAngle) * coreDist),
              (leftTop.z + Math.sin((3*Math.PI/2) - baseAngle - bottomAngle) * coreDist) );

    this.topNext = new PVector(
            (scale*4 + Math.cos((3*Math.PI/2) - baseAngle - bottomAngle - topAngle) * topDist),
            (leftTop.z + Math.sin((3*Math.PI/2) - baseAngle - bottomAngle - topAngle)* topDist));

    this.originTop3 = new PVector(this.top3.x, this.top3.y);
    this.originTop4 = new PVector(this.top4.x, this.top4.y);
    this.originTopCore = new PVector(this.topCore.x, this.topCore.y);
    this.originTopNext = new PVector(this.topNext.x, this.topNext.y);

    /** change top3, top4, topcore, topnext value***/
    this.applyMaterialThickness();
    /*****/


    let distBtw34 = this.distance(this.top3,this.top4);

    this.wings = new Array(8);

    let distBtwnNC = this.distance(this.topCore, this.topNext);

    this.wings[0] = new PVector.sub(this.originTopCore, this.originTop3);
    this.wings[0].norm();
    this.wings[0].rotateBy(Math.PI - this.angle3);
    this.wings[0].mult(rightBottom.z);
    this.wings[0].add(this.originTopCore);

    this.wings[1] = new PVector.sub(this.originTopCore, this.originTop3);
    this.wings[1].norm();
    this.wings[1].rotateBy(Math.PI - this.angle3);
    this.wings[1].mult(rightTop.z);
    this.wings[1].add(this.originTop3);

    this.wings[2] = new PVector.sub(this.originTopNext, this.originTopCore);
    this.wings[2].norm();
    this.wings[2].rotateBy(Math.PI - this.angle2);
    this.wings[2].mult( this.getInterpolatedHeight(leftBottom.z, rightBottom.z, this.material/this.scale));
    this.wings[2].add(this.topNext);


    this.wings[3] = new PVector.sub(this.originTopNext, this.originTopCore);
    this.wings[3].norm();
    this.wings[3].rotateBy(Math.PI - this.angle2);
    this.wings[3].mult( this.getInterpolatedHeight(rightBottom.z, leftBottom.z, this.material/this.scale));
    this.wings[3].add(this.topCore);

    this.wings[4] = new PVector.sub(this.originTopNext, this.originTop4);
    this.wings[4].norm();
    this.wings[4].rotateBy(-this.angle1);
    this.wings[4].mult(leftTop.z);
    this.wings[4].add(this.originTop4);


    this.wings[5] = PVector.sub(this.originTopNext, this.originTop4);
    this.wings[5].norm();
    this.wings[5].rotateBy(-this.angle1);
    this.wings[5].mult(leftBottom.z);
    this.wings[5].add(this.originTopNext);

    this.wings[6] = new PVector(this.top4.x , 0);
    this.wings[7] = new PVector(this.top3.x , 0);

    let flapScale = this.scale/4;

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
    let leftBottom = this.heightInfo.leftBottom;// [1]
    let rightBottom = this.heightInfo.rightBottom;// [2]
    let leftTop = this.heightInfo.leftTop;// [0]
    let rightTop = this.heightInfo.rightTop;//[3]


    this.top0 = new PVector(this.scale *0, leftTop.z);
    this.top1 = new PVector(this.scale *1, leftBottom.z);
    this.top2 = new PVector(this.scale *2, rightBottom.z);
    this.top3 = new PVector(this.scale *3, rightTop.z);
    this.top4 = new PVector(this.scale *4, leftTop.z);

    let bottom4 = new PVector(this.scale *4, 0);

    this.baseAngle = PVector.angleBetween(PVector.sub(bottom4, this.top4), PVector.sub(this.top3, this.top4));

    // Get top part's math

    this.topV = PVector.sub(leftBottom, leftTop);
    this.coreV = PVector.sub(rightBottom, leftTop);
    this.bottomV = PVector.sub(rightTop, leftTop);

    let topV = this.topV;
    let coreV = this.coreV;
    let bottomV = this.bottomV;

    this.topAngle = PVector.angleBetween(topV,coreV);
    this.bottomAngle = PVector.angleBetween(coreV,bottomV);

    this.topDist = this.distance(leftBottom, leftTop);
    this.coreDist = this.distance(rightBottom, leftTop);
    this.bottomDist = this.distance(rightTop, leftTop);

    let downVector = new PVector(0, -1);

    let pv1 = PVector.sub(this.top1, this.top0);
    pv1.norm();
    this.angle1 = PVector.angleBetween(pv1, downVector);


    let pv2 = PVector.sub(this.top2, this.top1);
    pv2.norm();
    this.angle2 = PVector.angleBetween(pv2, downVector);

    let pv3 = PVector.sub(this.top3, this.top2);
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
    let numberPolygonToAttch = getNode('path', {d:numberPolygon.join(' '), style: "stroke-width:0.001;stroke:black;fill:none", 'transform': `rotate(180 ${ offsetx + this.scale*0.3} 3)`})

    this.pathGroup.appendChild(numberPolygonToAttch);
  }



  drawPolygon () {
    let e = function (v) {
        return ` ${v.x},${v.y}`;
    }

    let ps = [];

    ps.push(e(this.originTopNext));
    ps.push(e(this.topNext));
    ps.push(e(this.flaps[0]));
    ps.push(e(this.flaps[1]));

    ps.push(e(this.wings[2]));

    ps.push(e(this.wings[3]));
    ps.push(e(this.flaps[3]));
    ps.push(e(this.flaps[2]));
    ps.push(e(this.topCore));
    ps.push(e(this.originTopCore));


    ps.push(e(this.wings[0]));
    ps.push(e(this.wings[1]));

    ps.push(e(this.originTop3))
    ps.push(e(this.top3));
    ps.push(e(this.flaps[5]));
    ps.push(e(this.flaps[4]));
    ps.push(e(this.wings[7]));
    //ps.push(e(new PVector(this.scale*3, 0)));

    ps.push(e(this.wings[6]));
    //ps.push(e(new PVector(this.scale*4, 0)));
    ps.push(e(this.flaps[6]));
    ps.push(e(this.flaps[7]));
    ps.push(e(this.top4));
    ps.push(e(this.originTop4));


    ps.push(e(this.wings[4]));
    ps.push(e(this.wings[5]));

    var polygonNode = getNode('polygon', {points: ps.join(' '), style: "stroke-width:0.001;stroke:red;fill:none" , rel: `${this.xIndex}-${this.yIndex}` });
    this.pathGroup.appendChild(polygonNode);
  }

  draw () {
    this.unfold();
    // this.applyMaterialThickness();
    this.unfoldWide();
    this.writeNumber();
    this.drawPolygon();
  }


  getPathGroup () {
    return this.pathGroup;
  }

}

module.exports = { Unit }