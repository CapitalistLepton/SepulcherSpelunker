class HeapElement {
  constructor(data, priority) {
    this.data = data;
    this.priority = priority;
  }
}

class PriorityQueue {
  constructor() {
    this.heap = [null];
    this.length = 0;
  }

  add(data, priority) {
    const newVal = new HeapElement(data, priority);
    this.heap.push(newVal);
    this.length++;
    let current = this.heap.length - 1;
    let parent = Math.floor(current / 2);
    while (this.heap[parent] && newVal.priority < this.heap[parent].priority) {
      const par = this.heap[parent];
      this.heap[parent] = this.heap[current];
      this.heap[current] = par;
      current = parent;
      parent = Math.floor(current / 2);
    }
  }

  pop() {
    let res;
    if (this.heap.length < 3) {
      res = this.heap.pop();
      this.heap[0] = null;
      this.length = Math.max(this.length - 1, 0);
    } else {
      res = this.heap[1];
      this.heap[1] = this.heap.pop();
      this.length--;
      let current = 1;
      let left = 2 * current;
      let right = left + 1;
      let child;
      if (this.heap[right]
        && this.heap[right].priority <= this.heap[left].priority) {
        child = right;
      } else {
        child = left;
      }
      while (this.heap[child]
        && this.heap[current].priority >= this.heap[child].priority) {
        let node = this.heap[current];
        this.heap[current] = this.heap[child];
        this.heap[child] = node;

        current = child;
        left = 2 * current;
        right = left + 1;
        if (this.heap[right]
          && this.heap[right].priority <= this.heap[left].priority) {
          child = right;
        } else {
          child = left;
        }
      }
    }
    return res;
  }

  toString() {
    let str = '[';
    str += this.heap[0];
    for (let i = 1; i < this.heap.length; i++) {
      str += ', ' + this.heap[i].data;
    }
    str += ']';
    return str;
  }
}
/*
let q = new PriorityQueue();
q.add(4, 100);
q.add(2, 1);
q.add(3, 5);
q.add(1, 0);
let p = q.pop();
while (p) {
  console.log(p);
  p = q.pop();
}
*/
class StarNode {
  constructor(parent, point, f, g) {
    this.parent = parent;
    this.point = point;
    this.f = f;
    this.g = g;
  }
}

function aStar(world, start, goal) {
  let open = new PriorityQueue();
  let closed = new Set();
  let newPoints = new Set();
  let fScores = new Map();

  let startNode = new StarNode(null, start, cartesianDistance(start, goal), 0);
  open.add(startNode, startNode.f);
  fScores.set(pointToString(startNode.point), startNode.f);

  while (open.length > 0) {
    let current = open.pop().data;
    if (current.point.x === goal.x && current.point.y === goal.y) {
      let result = [current.point];
      let par = current.parent;
      while (par) {
        result.push(par.point);
        par = par.parent;
      }
      // Make results have centered x,y points that can be used
      for (let i = 0; i < result.length; i++) {
        let tile = result[i];
        tile.x = (tile.x * 32) + 0;
        tile.y = (tile.y * 32) + 0;
      }
      console.debug('Found path', result);
      return result;
    } else {
      closed.add(pointToString(current.point));
      if (newPoints.size > 9600) {
        console.debug(newPoints);
        return null;
      }
      let neighbors = getNeighbors(world, current.point);
      for (let i = 0; i < neighbors.length; i++) {
        if (!closed.has(pointToString(neighbors[i]))) {
          let g = current.g + cartesianDistance(neighbors[i], current.point);
          let f = g + cartesianDistance(neighbors[i], goal);
          let node = new StarNode(current, neighbors[i], f, g);
          if (fScores.has(pointToString(neighbors[i]))) {
            if (fScores.get(pointToString(neighbors[i])) > f) {
              open.add(node, f);
            }
          } else {
            newPoints.add(pointToString(neighbors[i]));
            fScores.set(pointToString(neighbors[i]), f);
            open.add(node, f);
          }
        }
      }
    }
  }
}

function getNeighbors(world, point) {
  let results = [];
  if (world[point.y + 1] && world[point.y + 1][point.x] === 0) {
    results.push(new Point(point.x, point.y + 1));
  }
  if (world[point.y - 1] && world[point.y - 1][point.x] === 0) {
    results.push(new Point(point.x, point.y - 1));
  }
  if (world[point.y][point.x - 1] === 0) {
    results.push(new Point(point.x - 1, point.y));
  }
  if (world[point.y][point.x + 1] === 0) {
    results.push(new Point(point.x + 1, point.y));
  }
  return results;
}

function pointToString(point) {
  return `x: ${point.x} y: ${point.y}`
}
