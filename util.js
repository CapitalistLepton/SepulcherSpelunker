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
  let difX = pointB.x - pointA.x;
  let difY = pointB.y - pointA.y;
  return Math.sqrt(difX * difX + difY * difY);
}

function taxiDistance(pointA, pointB) {
  return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}

function equivalent(a, b) {
  if (a !== Object(a) || b !== Object(b)) {
    return a === b; // a or b is a primitive
  }
  let aProperties = Object.getOwnPropertyNames(a);
  let bProperties = Object.getOwnPropertyNames(b);

  if (aProperties.length !== bProperties.length) {
    return false;
  }
  for (let i = 0; i < aProperties.length; i++) {
    let name = aProperties[i];
    if (a[name] !== b[name]) {
      return false;
    }
  }
  return true;
}

class Node {
  constructor(data, next) {
    this.data = data;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  add(data) {
    if (!this.head) {
      this.head = new Node(data, null);
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = new Node(data, null);
    }
    this.length++;
  }

  remove(data) {
    while (this.head && equivalent(this.head.data, data)) {
      this.head = this.head.next;
      this.length--;
    }
    if (this.head) {
      let current = this.head;
      while (current.next) {
        if (equivalent(current.next.data, data)) {
          current.next = current.next.next;
          this.length--;
        } else {
          current = current.next;
        }
      }
    }
  }

  removeRandom() {
    let index = randInt(this.length);
    let current = this.head
    let data;
    if (index === 0) {
      data = current.data;
      this.head = this.head.next;
    } else {
      while (current.next && index > 1) {
        current = current.next;
        index--;
      }
      data = current.next.data;
      current.next = current.next.next;
    }
    this.length--;
    return data;
  }

  removeAll() {
    this.head = null;
  }

  get(index) {
    let current = this.head;
    let i = index;
    while(current && current.next && i > 0) {
      current = current.next;
      i--;
    }
    if (i > 0 || !current) {
      return null;
    } else {
      return current.data;
    }
  }

  contains(data) {
    if (this.head) {
      let current = this.head;
      if (equivalent(current.data, data)) {
        return true;
      }
      while (current.next) {
        current = current.next;
        if (equivalent(current.data, data)) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  iterate(func) {
    if (this.head) {
      let current = this.head;
      while (current.next) {
        func(current.data);
        current = current.next;
      }
      func(current.data); // One last one that does'nt have a next
    }
  }
}

class LinkedQueue {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  enqueue(data) {
    if (!this.head) {
      this.head = new Node(data, null);
      this.tail = this.head;
    } else {
      this.tail.next = new Node(data, null);
      this.tail = this.tail.next;
    }
    this.length++;
  }

  dequeue() {
    if (!this.head) {
      return null;
    } else {
      let data = this.head.data;
      this.head = this.head.next;
      this.length--;
      return data;
    }
  }
}

function findPath(world, pathStart, pathEnd) {
  // shortcuts for speed
  let abs = Math.abs;

  /** 1 is wall 0 is dirt */
  let maxWalkableTileNum = 0;

  // keep track of the world dimensions
  // Note that this A-star implementation expects the world array to be square:
  // it must have equal height and width. If your game world is rectangular,
  // just fill the array with dummy values to pad the empty space.
  let worldWidth = (world[0].length + 20);
  let worldHeight = (world.length);
  let worldSize = worldWidth * worldHeight;



  let worldZero = [[]];

  // create emptiness
  for (let y = 0; y < worldHeight; y++) {
    worldZero[y] = [];
    for (let x = 0; x < worldWidth; x++) {
      worldZero[y][x] = 0;
    }
  }


  // Read our map and make mark the no-go zones
  for (let y = 0; y < worldHeight; y++) {
    for (let x = 0; x < worldWidth; x++) {
      if (world[y][x] === 'Start') {
        console.log("x: " + x + ", " + y);

      }
      if (x > WORLD_WIDTH - 1) {
        worldZero[y][x] = 1;
      } else  if (world[y][x] === 'W') {
        worldZero[y][x] = 1;
      }
    }
  }



  //no diagonals (Manhattan)
  let distanceFunction = ManhattanDistance;
  let findNeighbours = function () {}; // empty


  // distanceFunction function
  // linear movement - no diagonals - just cardinal directions (NSEW)
  function ManhattanDistance(Point, Goal) {
    return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
  }


// Neighbours functions, used by findNeighbours function
// to locate adjacent available cells that aren't blocked

// Returns every available North, South, East or West
// cell that is empty. No diagonals,
  function Neighbours(x, y) {
    let N = y - 1,
        S = y + 1,
        E = x + 1,
        W = x - 1,
        myN = N > -1 && canWalkHere(x, N),
        myS = S < worldHeight && canWalkHere(x, S),
        myE = E < worldWidth && canWalkHere(E, y),
        myW = W > -1 && canWalkHere(W, y),
        result = [];
    if(myN) result.push({x: x, y: N});
    if(myE) result.push({x: E, y: y});
    if(myS) result.push({x: x, y: S});
    if(myW) result.push({x: W, y: y});
    // findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
    return result;
  }

  // returns boolean value (world cell is available and open)
  function canWalkHere(x, y) {
    return ((worldZero[y] != null) &&
      (worldZero[y][x] != null) &&
      (worldZero[y][x] <= maxWalkableTileNum));
  }

  // Node function, returns a new object with Node properties
  // Used in the calculatePath function to store route costs, etc.
  function Node(Parent, Point) {
    let newNode = {
      // pointer to another Node object
      Parent: Parent,
      // array index of this Node in the world linear array
      value: Point.x + (Point.y * worldWidth),
      // the location coordinates of this Node
      x: Point.x,
      y: Point.y,
      // the distanceFunction cost to get
      // TO this Node from the START
      f: 0,
      // the distanceFunction cost to get
      // from this Node to the GOAL
      g: 0
    };

    return newNode;
  }


// Path function, executes AStar algorithm operations
  function calculatePath() {
    // create Nodes from the Start and End x,y coordinates
    let mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
    let mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
    // create an array that will contain all world cells
    let AStar = new Array(worldSize);
    // list of currently open Nodes
    let Open = [mypathStart];
    // list of closed Nodes
    let Closed = [];
    // list of the final output array
    let result = [];
    // reference to a Node (that is nearby)
    let myNeighbours;
    // reference to a Node (that we are considering now)
    let myNode;
    // reference to a Node (that starts a path in question)
    let myPath;
    // temp integer variables used in the calculations
    let length, max, min, i, j;

    // iterate through the open list until none are left
    // a) While the open list is not empty
    while(length = Open.length) {
      max = worldSize;
      min = -1;

      // a) find the node with the least f on
      //    the open list, call it "q"
      for(i = 0; i < length; i++) {
        // Open.f is Cost to get from start node to this node
        if(Open[i].f < max) {
          max = Open[i].f;
          min = i;
        }
      }
      // grab the next node and remove it from Open array
      // b) pop q off the open list
      myNode = Open.splice(min, 1)[0];

      // is it the destination node?
      // d) for each successor
      if(myNode.x === mypathEnd.x && myNode.y === mypathEnd.y) {
        // i) if successor is the goal, stop search
        myPath = Closed[Closed.push(myNode) - 1];
        do {
          result.push([myPath.x, myPath.y]);
        }

        while (myPath = myPath.Parent);
        // clear the working arrays
        AStar = Closed = Open = [];

        // we want to return start to finish
        result.reverse();
      }
      // not the destination
      else {
        // find which nearby nodes are walkable
        myNeighbours = Neighbours(myNode.x, myNode.y);
        // test each one that hasn't been tried already
        for(i = 0, j = myNeighbours.length; i < j; i++) {
          myPath = Node(myNode, myNeighbours[i]);
          if (!AStar[myPath.value]) {
            // estimated cost of this particular route so far
            myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
            // estimated cost of entire guessed route to the destination
            myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
            // remember this new path for testing above
            Open.push(myPath);
            // mark this node in the world graph as visited
            AStar[myPath.value] = true;
          }
        }
        // remember this route as having no more untested options
        Closed.push(myNode);
      }
    } // keep iterating until until the Open list is empty
    console.log("Scope this out: " + result);
    result.forEach(function(tile) {
        tile[0] = (tile[0] * 64) + 18; // center goblin on the tile
        tile[1] = (tile[1] * 64) + 10; // center gobline on the tile.
      });
      console.log("Scope this out: " + result);
      
      return result.reverse();
  }
  

// actually calculate the a-star path!
// this returns an array of coordinates
// that is empty if no path is possible
  return calculatePath();

} // end of findPath() function
