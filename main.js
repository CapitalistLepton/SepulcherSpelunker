const AM = new AssetManager();

class Animation {
  constructor(spritesheet, startX, startY, frameWidth, frameHeight, sheetWidth, frameDuration,
    frames, loop) {
    this.spriteSheet = spritesheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frameDuration = frameDuration;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
  }

  drawFrame(tick, ctx, x, y, scaleBy) {
    let scale = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.isDone()) {
      if (this.loop) {
        this.elapsedTime -= this.totalTime;
      }
    }
    let frame = this.currentFrame();

    let index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    let vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
      index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
      vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
      index -= Math.floor(this.spriteSheet.width / this.frameWidth);
      vindex++;
    }
    let locX = x;
    let locY = y;
    let offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
      index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
      this.frameWidth, this.frameHeight,
      locX, locY,
      this.frameWidth * scale,
      this.frameHeight * scale);
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
  constructor(game, spritesheet, sx, sy, sw, sh, x, y, w, h) {
    this.game = game;
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
    moveEntity(this);
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
  constructor(game, spritesheet, x, y, w, h) {
    super(game, spritesheet, 0, 0, 64, 64, x, y, w, h);
  }
}

class Wall extends Tile {
  constructor(game, spritesheet, x, y, w, h) {
    super(game, spritesheet, 64, 0, 64, 64, x, y, w, h);
    this.collision = true;
  }
}

class Staircase extends Tile {
  constructor(game, spritesheet, x, y, w, h) {
    super(game, spritesheet, 32, 0, 16, 16, x, y, w, h);
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
    moveEntity(this);
  }

  draw(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
  }
}

class HealthPotion extends Powerup {
  constructor(game, spritesheet, x, y) {
    super(game, new Animation(spritesheet, 0, 0, 32, 32, 192, 0.167, 6, true), x, y);
  }

  update() {
    super.update();
    // Check for collision with DonJon
  }
}

class LifeBuff extends Powerup {
  constructor(game, spritesheet, x, y) {
    super(game, new Animation(spritesheet, 0, 0, 32, 32, 128, 0.25, 4, true), x, y);
  }

  update() {
    super.update();
    // Check for collision with DonJon
  }
}

class StrengthBuff extends Powerup {
  constructor(game, spritesheet, x, y) {
    super(game, new Animation(spritesheet, 0, 0, 32, 32, 64, 0.5, 2, true), x, y);
  }

  update() {
     super.update();
    // Check for collision with DonJon
  }
}

class Enemy {
  // TODO change spritesheet to state machine
  constructor(game, spritesheet, sx, sy, sw, sh, x, y, w, h) {
    this.game = game;
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
    moveEntity(this);
  }

  draw(ctx) {
    ctx.drawImage(this.spritesheet,
      this.sx, this.sy,
      this.sw, this.sh,
      this.x, this.y,
      this.w, this.h);
  }
}

class Goblin extends Enemy {
  constructor(game, spritesheet, x, y, w, h) {
    super(game, spritesheet, 0, 0, 32, 64, x, y, w, h);
  }

  update() {
    super.update();
  }
}

class Beholder extends Enemy {
  constructor(game, spritesheet, x, y, w, h) {
    super(game, spritesheet, 0, 0, 64, 64, x, y, w, h);
  }

  update() {
    super.update();
  }
}

class DonJon {
  constructor(gameEngine, spritesheet, x, y, w, h) {
    this.game = gameEngine;
    this.spritesheet = spritesheet;
    this.sx = 0;
    this.sy = 66;
    this.sw = 32;
    this.sh = 64;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.bounding = new Rectangle(x, y, w, h);
    this.prevX = x;
    this.prevY = y;
    this.speed = 100; // in px/s
    this.health = 24;
    this.direction = 'S';
    this.stateMachine = new StateMachine('idleDownDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0, 0, 32, 64, 2, 0.5, 2, true));
    this.stateMachine.addState('idleDownDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0, 0, 32, 64, 2, 0.5, 2, true));
    this.stateMachine.addState('idleLeftDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0 ,64, 32, 64, 2, 0.5, 2, true));
    this.stateMachine.addState('idleUpDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0, 128, 32, 64, 2, 0.5, 2, true));
    this.stateMachine.addState('idleRightDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0, 192, 32, 64, 2, 0.5, 2, true));
    this.stateMachine.addState('runDownDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0, 256, 32, 64, 2, 0.167, 2, true));
    this.stateMachine.addState('runLeftDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0 ,320, 32, 64, 6, 0.167, 6, true));
    this.stateMachine.addState('runUpDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0 ,384, 32, 64, 2, 0.167, 2, true));
    this.stateMachine.addState('runRightDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0, 448, 32, 64, 6, 0.167, 6, true));
    this.stateMachine.addState('attackDownDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0, 512, 32, 64, 5, 0.2, 5, true));
    this.stateMachine.addState('attackLeftDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0, 576, 32, 64, 4, 0.25, 4, true));
    this.stateMachine.addState('attackUpDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0, 640, 32, 64, 6, 0.167, 6, true));
    this.stateMachine.addState('attackRightDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 0, 704, 32, 64, 4, 0.25, 4, true));

  }

  update() {
    /* Here we check to see if any buttons where pressed if so move DonJon */
    if (mouseCooldown) {
      if (mouseValue) {
        switch(this.direction) {
          case 'N': this.stateMachine.setState('attackUpDJ'); break;
          case 'E': this.stateMachine.setState('attackRightDJ'); break;
          case 'S': this.stateMachine.setState('attackDownDJ'); break;
          case 'W': this.stateMachine.setState('attackLeftDJ'); break;
        }
        mouseValue = false;
      }
    } else {
      if (cursor.rightPressed) {
        this.stateMachine.setState('runRightDJ');
        this.direction = 'E';
      } else if (cursor.leftPressed) {
        this.stateMachine.setState('runLeftDJ');
        this.direction = 'W';
      }
      if (cursor.upPressed) {
        this.stateMachine.setState('runUpDJ');
        this.direction = 'N';
      } else if (cursor.downPressed && this.y >= 0) {
        this.stateMachine.setState('runDownDJ');
        this.direction = 'S';
      }
      if (!cursor.upPressed && !cursor.downPressed && !cursor.rightPressed &&
        !cursor.leftPressed) {
        switch(this.direction) {
          case 'N': this.stateMachine.setState('idleUpDJ'); break;
          case 'E': this.stateMachine.setState('idleRightDJ'); break;
          case 'S': this.stateMachine.setState('idleDownDJ'); break;
          case 'W': this.stateMachine.setState('idleLeftDJ'); break;
        }
      }
    }
  }

  draw(ctx) {
    this.stateMachine.draw(this.game.clockTick, ctx, this.x, this.y);

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
        return new Goblin(gameEngine, AM.getAsset('./img/goblin.png'), x, y,
          SIZE, SIZE * 2);
      },
      width: 1,
      height: 2,
      number: 5
    },
    {
      name: 'eBeholder',
      constructor: function (x, y) {
        return new Beholder(gameEngine, AM.getAsset('./img/beholder.png'), x, y,
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
        case 'W': stationary.push(new Wall(gameEngine, AM.getAsset('./img/map.png'),
          i * SIZE, j * SIZE, SIZE, SIZE)); break;
        case 'F': tiles.push(new Dirt(gameEngine, AM.getAsset('./img/map.png'),
          i * SIZE, j * SIZE, SIZE, SIZE)); break;
        case 'End':
        case 'Start': stationary.push(new Staircase(
          gameEngine, AM.getAsset('./img/tilesheet.png'), i * SIZE, j * SIZE,
          SIZE, SIZE));
          don = new DonJon(gameEngine, AM.getAsset('./img/main_dude.png'), i * SIZE,
            (j - 1) * SIZE, SIZE, SIZE * 2);
          break;
      }
      for (let k = 0; k < powerups.length; k++) {
        if (level.tiles[j][i] === powerups[k].name) {
          tiles.push(new Dirt(gameEngine, AM.getAsset('./img/map.png'), i * SIZE,
            j * SIZE, SIZE, SIZE));
          powerupEntities.push(powerups[k].constructor(i * SIZE, j * SIZE));
        }
      }
      for (let k = 0; k < enemies.length; k++) {
        if (level.tiles[j][i] === enemies[k].name) {
          tiles.push(new Dirt(gameEngine, AM.getAsset('./img/map.png'), i * SIZE,
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
