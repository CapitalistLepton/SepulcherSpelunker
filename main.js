const AM = new AssetManager();

class Animation {
  constructor(spritesheet, frameWidth, frameHeight, sheetWidth, frameDuration,
    frames, loop) {
    this.spritesheet = spritesheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frameDuration = frameDuration;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
  }

  drawFrame(tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
      if (this.loop) {
        this.elapsedTime -= this.totalTime;
      }
    }
    let frame = this.currentFrame();
    let xindex = 0;
    let yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spritesheet,
                  xindex * this.frameWidth, yindex * this.frameHeight,
                  this.frameWidth, this.frameHeight,
                  x, y,
                  this.frameWidth, this.frameHeight);
  }

  currentFrame() {
    return Math.floor(this.elapsedTime / this.frameDuration);
  }

  isDone() {
    return (this.elapsedTime >= this.totalTime);
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

class Tile {
  constructor(spritesheet, sx, sy, sw, sh, x, y, w, h) {
    this.spritesheet = spritesheet;
    this.sx = sx;
    this.sy = sy;
    this.sw = sw;
    this.sh = sh;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  update() {
    // Intentionally blank
  }

  draw(ctx) {
    ctx.drawImage(this.spritesheet,
                  this.sx, this.sy,
                  this.sw, this.sh,
                  this.x, this.y,
                  this.w, this.h);
  }
}

class Dirt extends Tile {
  constructor(spritesheet, x, y, w, h) {
    super(spritesheet, 0, 0, 64, 64, x, y, w, h);
  }
}

class Wall extends Tile {
  constructor(spritesheet, x, y, w, h) {
    super(spritesheet, 64, 0, 64, 64, x, y, w, h);
    this.collision = true;
  }
}

class Staircase extends Tile {
  constructor(spritesheet, x, y, w, h) {
    super(spritesheet, 32, 0, 16, 16, x, y, w, h);
    this.collision = true;
  }
}

class Powerup {
  constructor(game, animation, x, y) {
    this.game = game;
    this.animation = animation;
    this.x = x;
    this.y = y;
  }

  update() {
    // Need to implement in superclasses
  }

  draw(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
  }
}

class HealthPotion extends Powerup {
  constructor(game, spritesheet, x, y) {
    super(game, new Animation(spritesheet, 32, 32, 192, 0.167, 6, true), x, y);
  }

  update() {
    // Check for collision with DonJon
  }
}

class LifeBuff extends Powerup {
  constructor(game, spritesheet, x, y) {
    super(game, new Animation(spritesheet, 32, 32, 128, 0.25, 4, true), x, y);
  }

  update() {
    // Check for collision with DonJon
  }
}

class StrengthBuff extends Powerup {
  constructor(game, spritesheet, x, y) {
    super(game, new Animation(spritesheet, 32, 32, 64, 0.5, 2, true), x, y);
  }

  update() {
    // Check for collision with DonJon
  }
}

class Enemy {
  // TODO change spritesheet to state machine
  constructor(spritesheet, sx, sy, sw, sh, x, y, w, h) {
    this.spritesheet = spritesheet;
    this.sx = sx;
    this.sy = sy;
    this.sw = sw;
    this.sh = sh;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  update() {}

  draw(ctx) {
    ctx.drawImage(this.spritesheet,
                  this.sx, this.sy,
                  this.sw, this.sh,
                  this.x, this.y,
                  this.w, this.h);
  }
}

class Goblin extends Enemy {
  constructor(spritesheet, x, y, w, h) {
    super(spritesheet, 0, 0, 32, 64, x, y, w, h);
  }

  update() {
    // TODO
  }
}

class Beholder extends Enemy {
  constructor(spritesheet, x, y, w, h) {
    super(spritesheet, 0, 0, 64, 64, x, y, w, h);
  }

  update() {
    // TODO
  }
}

class DonJon {
  constructor(spritesheet, x, y, w, h) {
    this.spritesheet = spritesheet;
    this.sx = 0;
    this.sy = 0;
    this.sw = 32;
    this.sh = 64;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.bounding = new Rectangle(x, y, w, h);
    this.prevX = x;
    this.prevY = y;
    this.health = 24;
  }

  update() {
  }

  draw(ctx) {
    ctx.drawImage(this.spritesheet,
                  this.sx, this.sy,
                  this.sw, this.sh,
                  this.x, this.y,
                  this.w, this.h);
  }
}

AM.queueDownload('./img/tilesheet.png');
AM.queueDownload('./img/potion.png');
AM.queueDownload('./img/life.png');
AM.queueDownload('./img/strength.png');
AM.queueDownload('./img/map.png');
AM.queueDownload('./img/goblin.png');
AM.queueDownload('./img/beholder.png');
AM.queueDownload('./img/main_dude.png');


AM.downloadAll(function () {
  const canvas = document.getElementById('gameWorld');
  const ctx = canvas.getContext('2d');

  const gameEngine = new GameEngine();
  gameEngine.init(ctx);
  gameEngine.start();

  const SIZE = 32;

  const powerups = [
    {
      name: 'pHealth',
      constructor: function (x, y) {
        return new HealthPotion(gameEngine, AM.getAsset('./img/potion.png'),
          x, y);
      },
      number: 2
    },
    {
      name: 'pLife',
      constructor: function (x, y) {
        return new LifeBuff(gameEngine, AM.getAsset('./img/life.png'), x, y);
      },
      number: 1
    },
    {
      name: 'pStrength',
      constructor: function (x, y) {
        return new StrengthBuff(gameEngine, AM.getAsset('./img/strength.png'), x,
          y);
      },
      number: 1
    }
  ];


  const enemies = [
    {
      name: 'eGoblin',
      constructor: function (x, y) {
        return new Goblin(AM.getAsset('./img/goblin.png'), x, y,
          SIZE, SIZE * 2);
      },
      width: 1,
      height: 2,
      number: 5
    },
    {
      name: 'eBeholder',
      constructor: function (x, y) {
        return new Beholder(AM.getAsset('./img/beholder.png'), x, y,
          SIZE * 2, SIZE * 2);
      },
      width: 2,
      height: 2,
      number: 2
    }
  ];

  const level = new World(powerups, enemies);
  // Attach entities to the Level data
  let tiles = [];
  let enemyEntities = [];
  let powerupEntities = [];
  let stationary = [];
  let don = undefined;
  for (let i = 0; i < level.tiles[0].length; i++) {
    for (let j = 0; j < level.tiles.length; j++) {
      switch (level.tiles[j][i]) {
        case 'W': stationary.push(new Wall(AM.getAsset('./img/map.png'),
          i * SIZE, j * SIZE, SIZE, SIZE)); break;
        case 'F': tiles.push(new Dirt(AM.getAsset('./img/map.png'),
          i * SIZE, j * SIZE, SIZE, SIZE)); break;
        case 'End':
        case 'Start': stationary.push(new Staircase(
          AM.getAsset('./img/tilesheet.png'), i * SIZE, j * SIZE, SIZE, SIZE));
          don = new DonJon(AM.getAsset('./img/main_dude.png'), i * SIZE, (j - 1) * SIZE, SIZE, SIZE * 2);
          break;
      }
      for (let k = 0; k < powerups.length; k++) {
        if (level.tiles[j][i] === powerups[k].name) {
          tiles.push(new Dirt(AM.getAsset('./img/map.png'), i * SIZE,
            j * SIZE, SIZE, SIZE));
          powerupEntities.push(powerups[k].constructor(i * SIZE, j * SIZE));
        }
      }
      for (let k = 0; k < enemies.length; k++) {
        if (level.tiles[j][i] === enemies[k].name) {
          tiles.push(new Dirt(AM.getAsset('./img/map.png'), i * SIZE,
            j * SIZE, SIZE, SIZE));
          enemyEntities.push(enemies[k].constructor(i * SIZE, j * SIZE));
        }
      }
    }
  }

  for (let i = 0; i < tiles.length; i++) {
    gameEngine.addEntity(tiles[i]);
  }
  for (let i = 0; i < stationary.length; i++) {
    gameEngine.addEntity(stationary[i]);
  }
  for (let i = 0; i < powerupEntities.length; i++) {
    gameEngine.addEntity(powerupEntities[i]);
  }
  for (let i = 0; i < enemyEntities.length; i++) {
    gameEngine.addEntity(enemyEntities[i]);
  }

  gameEngine.addEntity(don);

  console.log('Finished downloading assets');
});
