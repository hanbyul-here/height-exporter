import PVector from 'pvectorjs';

PVector.prototype.distance = function(vec1, vec2) {
  if (vec1.z && vec2.z) {
    var dx = vec1.x - vec2.x;
    var dy = vec1.y - vec2.y;
    var dz = vec1.z - vec2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  } else if (vec1.y && vec2.y) {
    var dx = vec1.x - vec2.x;
    var dy = vec1.y - vec2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  return NaN;
}
console.log('from vector')
console.log(PVector.distance);
module.exports = PVector;