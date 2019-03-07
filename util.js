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