const Rooms = [
  { name: 'square',
    tiles: [['W', 'W', 'W', 'D', 'W', 'W', 'W'],
            ['W', 'D', 'D', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'D', 'D', 'W'],
	    ['D', 'D', 'D', 'D', 'D', 'D', 'D'],
            ['W', 'D', 'D', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'D', 'D', 'W'],
            ['W', 'W', 'W', 'D', 'W', 'W', 'W']]
  },
  { name: 'long',
    tiles: [['W', 'W', 'D', 'W', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'W', 'D', 'W', 'W']]
  }
];

/*
 * Generates a random int between [0, max).
 */
function randInt(max) {
  return Math.floor(Math.random() * max);
}

const LEVEL_WIDTH = 40;
const LEVEL_HEIGHT = 60;
const MIN_ROOMS = 5;
const MAX_ROOMS = 8;
const ROOM_OFFSET = 2;
class Level {
  constructor() {
    this.tiles = [];
    for (let i = 0; i < LEVEL_HEIGHT; i++) {
      this.tiles.push(new Array(LEVEL_WIDTH).fill('E'));
    }
    let rooms = [];
    for (let i = 0; i < randInt(MAX_ROOMS - MIN_ROOMS + 1) + MIN_ROOMS; i++) {
      rooms.push(Rooms[randInt(Rooms.length)]);
    }
    let room = rooms.pop();
    while (rooms.length > 0) {
      let x = randInt(LEVEL_WIDTH);
      let y = randInt(LEVEL_HEIGHT);
      if (this.isValidRoom(room, x, y)) {
        this.placeRoom(room, x, y); 
        room = rooms.pop();
      }
    }
    console.log('Created level');
  }

  /*
   * Verifies that the given room object can be placed in the level at the
   * given (x, y) coordinates.
   */
  isValidRoom(room, x, y) {
    if (x + room.tiles[0].length < LEVEL_WIDTH &&
        y + room.tiles.length < LEVEL_HEIGHT) {
      let minX = Math.max(0, x - ROOM_OFFSET);
      let maxX = Math.min(x + room.tiles[0].length + ROOM_OFFSET, LEVEL_WIDTH);
      let minY = Math.max(0, y - ROOM_OFFSET);
      let maxY = Math.min(y + room.tiles.length + ROOM_OFFSET, LEVEL_HEIGHT);
      for (let j = minY; j < maxY; j++) {
        for (let i = minX; i < maxX; i++) {
          if (this.tiles[j][i] !== 'E') {
            return false;
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }

  /*
   * Places the given room object at the given (x, y) coordinates.
   */
  placeRoom(room, x, y) {
    for (let j = y; j < y + room.tiles.length; j++) {
      for (let i = x; i < x + room.tiles[0].length; i++) {
        this.tiles[j][i] = room.tiles[j - y][i - x];
      }
    }
  }
}
