function print2D(ar) {
  for (let i = 0; i < ar.length; i++) {
//    for (let j = 0; j < ar[0].length; j++) {
      console.log(ar[i]);
  }
}

function randInt(max) {
  return Math.floor(Math.random() * max);
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

  print() {
    let current = this.head;
    let str = '[';
    while(current) {
      str += current.data.x + ' ' + current.data.y + ', ';
      current = current.next;
    }
    str += ']';
    console.log(str);
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

class Point {
  constructor(x, y, depth) {
    this.x = x;
    this.y = y;
    this.depth = depth;
  }
}

const WORLD_HEIGHT = 30;
const WORLD_WIDTH = 15;
class Test {
  constructor() {
    this.tiles = [];
    for (let i = 0; i < WORLD_HEIGHT; i++) {
      this.tiles.push(new Array(WORLD_WIDTH).fill('-'));
    }
    this.drunkardsWalk();
    this.cleanupTiles(0);
    this.placeEnd(0);
    print2D(this.tiles);
  }

  drunkardsWalk() {
    let position = { x: WORLD_WIDTH - 2, y: WORLD_HEIGHT - 2 };
    let direction = 'N';
    let possDirection = ['N', 'W'];
    this.floor = new LinkedList();
    while (position.x > Math.floor(WORLD_WIDTH / 8) && position.y > Math.floor(WORLD_HEIGHT / 4)) {
      this.tiles[position.y][position.x] = '#';
      this.floor.add({ x: position.x, y: position.y });
      switch (direction) {
        case 'N': position.y--; break;
        case 'E': position.x++; break;
        case 'S': position.y++; break;
        case 'W': position.x--; break;
      }
      possDirection = [];
      if (position.y > 2) {
        possDirection.push('N');
      }
      if (position.x < WORLD_WIDTH - 2) {
        possDirection.push('E');
      }
      if (position.y < WORLD_HEIGHT - 2) {
        possDirection.push('S');
      }
      if (position.x > 2) {
        possDirection.push('W');
      }
      direction = possDirection[randInt(possDirection.length)];
    }
  }

  tryWall(x, y) {
    if (x >= 0 && x < this.tiles[0].length && y >= 0 && y < this.tiles.length &&
        this.tiles[y][x] === '-') {
      this.tiles[y][x] = '|';
    }
  }

  /*
   * Cleans up the level by placing walls and the start/end points.
   */
  cleanupTiles(levelIndex) {
    // Place walls around floor
    for (let j = 0; j < this.tiles.length; j++) {
      for (let i = 0; i < this.tiles[0].length; i++) {
        if (this.tiles[j][i] === '#') {
          for (let k = -1; k <= 1; k++) {
            this.tryWall(k + i, j - 1);
            this.tryWall(k + i, j);
            this.tryWall(k + i, j + 1);
          }
        }
      }
    }
    // Place start and end points
    if (levelIndex % 2 === 0) {
      this.tiles[WORLD_HEIGHT - 2][WORLD_WIDTH - 2] = 'H';
    } else {
      this.tiles[WORLD_HEIGHT - 2][WORLD_WIDTH - 2] = 'O';
    }
    for (let j = WORLD_HEIGHT - 2; j >= WORLD_HEIGHT - 2 - 5; j--) {
      for (let i = WORLD_WIDTH - 2; i >= WORLD_WIDTH - 2 - 5; i--) {
        this.floor.remove({ x: i, y: j });
      }
    }
  }

  valueTile(i, j, values, level) {
    if (this.tiles[j][i] === '#') { //&& level > values[j][i]) {
/*      let value = Math.max(
        values[j][i - 1],
        values[j][i + 1],
        values[j - 1][i],
        values[j + 1][i]
      ) + 1; */
      //values[j][i] = Math.min(level, value);
      if (values[j][i] === 0 || level < values[j][i]) {
        values[j][i] = level;
        print2D(values);
        this.valueTile(i - 1, j, values, level + 1);
        this.valueTile(i, j - 1, values, level + 1);
        this.valueTile(i + 1, j, values, level + 1);
        this.valueTile(i, j + 1, values, level + 1);
      }
    }
  }

  breadthFirst(values) {
    let queue = new LinkedQueue();
    let visited = new LinkedList();
    queue.enqueue(new Point(WORLD_WIDTH - 2, WORLD_HEIGHT - 2, 0));
    let current = null;
    while (queue.length > 0) {
      current = queue.dequeue();
      let j = current.y;
      let i = current.x;
      values[j][i] = current.depth
      if (this.tiles[j - 1][i] === '#' && !visited.contains(new Point(i, j - 1))) {
        queue.enqueue(new Point(i, j - 1, current.depth + 1));
        visited.add(new Point(i, j - 1));
      }
      if (this.tiles[j + 1][i] === '#' && !visited.contains(new Point(i, j + 1))) {
        queue.enqueue(new Point(i, j + 1, current.depth + 1));
        visited.add(new Point(i, j + 1));
      }
      if (this.tiles[j][i - 1] === '#' && !visited.contains(new Point(i - 1, j))) {
        queue.enqueue(new Point(i - 1, j, current.depth + 1));
        visited.add(new Point(i - 1, j));
      }
      if (this.tiles[j][i + 1] === '#' && !visited.contains(new Point(i + 1, j))) {
        queue.enqueue(new Point(i + 1, j, current.depth + 1));
        visited.add(new Point(i + 1, j));
      }
    }
    console.log(current);
  }

  placeEnd(levelIndex) {
    let values = [];
    for (let i = 0; i < WORLD_HEIGHT; i++) {
      values.push(new Array(WORLD_WIDTH).fill(0));
    }
/*    for (let j = this.tiles.length - 2; j >= 0; j--) {
      for (let i = this.tiles[0].length - 2; i >= 0; i--) {
        if (this.tiles[j][i] === '#') { // Change to 'F'
          values[j][i] = Math.max(
            values[j][i - 1],
            values[j][i + 1],
            values[j - 1][i],
            values[j + 1][i]
          ) + 1;
        }
      }
    } */
//    this.valueTile(WORLD_WIDTH - 2, WORLD_HEIGHT - 2 - 1, values, 1);
//    this.valueTile(WORLD_WIDTH - 2 - 1, WORLD_HEIGHT - 2, values, 1);
    this.breadthFirst(values);
    print2D(values);
    let pos = { x: WORLD_WIDTH - 2, y: WORLD_HEIGHT -2 };
    let distance = 0;
    for (let j = this.tiles.length - 2; j >= 0; j--) {
      for (let i = this.tiles[0].length - 2; i >= 0; i--) {
        if (values[j][i] > distance) {
          distance = values[j][i];
          pos.x = i;
          pos.y = j;
        }
      }
    }
    for (let j = pos.y + 5; j >= pos.y - 5; j--) {
      for (let i = pos.x + 5; i >= pos.x - 5; i--) {
        this.floor.remove({ x: i, y: j });
      }
    }
    if (levelIndex % 2 === 0) {
      this.tiles[pos.y][pos.x] = 'O'; // Change to 'End'
    } else {
      this.tiles[pos.y][pos.x] = 'H'; // Change to 'Start'
    }
  }
}

let t = new Test();
