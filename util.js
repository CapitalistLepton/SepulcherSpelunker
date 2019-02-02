/*
 * Generates a random int between [0, max).
 */
function randInt(max) {
  return Math.floor(Math.random() * max);
}

function removeFrom(obj, array) {
  return array.filter((o) => o !== obj);
}

function cartesianDistance(pointA, pointB) {
  return Math.sqrt((pointB.x - pointA.x) * (pointB.x - pointA.x) +
                   (pointB.y - pointA.y) * (pointB.y - pointA.y));
}

function taxiDistance(pointA, pointB) {
  return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}
