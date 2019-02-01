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

function equivalent(a, b) {
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
}
