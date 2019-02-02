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

  update() {}

  draw(ctx) {
    ctx.drawImage(this.spritesheet,
      this.sx, this.sy,
      this.sw, this.sh,
      this.x - this.game.camera.x, this.y - this.game.camera.y,
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
    this.bounding = new Rectangle(x + 1, y + 1, w - 2, h - 2);
  }

  draw(ctx) {
    super.draw(ctx);
    if (this.game.collisionDebug) {
      ctx.strokeRect(this.bounding.x - this.game.camera.x,
        this.bounding.y - this.game.camera.y, this.bounding.w, this.bounding.h);
    }
  }
}

class Staircase extends Tile {
  constructor(game, spritesheet, x, y, w, h) {
    super(game, spritesheet, 32, 0, 16, 16, x, y, w, h);
// TODO    this.bounding = new Rectangle(x, y, w, h);
  }
}

class Powerup {
  constructor(game, animation, x, y) {
    this.game = game;
    this.animation = animation;
    this.x = x;
    this.y = y;
    this.bounding = new Rectangle(x, y, 32, 32);
  }

  update() {}

  draw(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y, 1);
  }
}

class HealthPotion extends Powerup {
  constructor(game, spritesheet, x, y) {
    super(game, new Animation(spritesheet, 0, 0, 32, 32, 192, 0.167, 6, true),
      x, y);
  }

  update() {
    // Check for collision with DonJon
  }
}

class LifeBuff extends Powerup {
  constructor(game, spritesheet, x, y) {
    super(game, new Animation(spritesheet, 0, 0, 32, 32, 128, 0.25, 4, true),
      x, y);
  }

  update() {
    // Check for collision with DonJon
  }
}

class StrengthBuff extends Powerup {
  constructor(game, spritesheet, x, y) {
    super(game, new Animation(spritesheet, 0, 0, 32, 32, 64, 0.5, 2, true), x,
      y);
  }

  update() {
    // Check for collision with DonJon
  }
}

class Camera {
  constructor(player) {
    this.player = player;
    this.x = player.x;
    this.y = player.y;
  }

  update() {
    this.x = this.player.x - this.w / 2;
    this.y = this.player.y - this.h / 2;
  }

  draw() {}
}

class Enemy {
  constructor(game, statemachine, sx, sy, sw, sh, x, y, w, h) {
    this.game = game;
    this.stateMachine = new StateMachine();
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
    this.stateMachine.draw(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y);

  }
}

class Goblin extends Enemy {
  constructor(game, statemachine, x, y, w, h) {
    super(game, statemachine, 0, 0, 32, 64, x, y, w, h);
    this.stateMachine = new StateMachine();
    /**
     * Goblin States
     */
    this.stateMachine.addState('idleDownGob',
      new Animation(AM.getAsset('./img/goblin.png'), 0, 0, 32, 50, 4, 0.25, 4, true));
    this.stateMachine.addState('idleLeftGob',
      new Animation(AM.getAsset('./img/goblin.png'), 0, 65, 32, 50, 2, 0.5, 2, true));
    this.stateMachine.addState('idleUpGob',
      new Animation(AM.getAsset('./img/goblin.png'), 0, 130, 32, 50, 2, 0.5, 2, true));
    this.stateMachine.addState('idleRightGob',
      new Animation(AM.getAsset('./img/goblin.png'), 0, 195, 32, 50, 3, 0.333, 3, true));
    this.stateMachine.addState('runDownGob',
      new Animation(AM.getAsset('./img/goblin.png'), 0, 260, 32, 50, 2, 0.5, 2, true));
    this.stateMachine.addState('runLeftGob',
      new Animation(AM.getAsset('./img/goblin.png'), 0, 325, 32, 50, 4, 0.25, 4, true));
    this.stateMachine.addState('runUpGob',
      new Animation(AM.getAsset('./img/goblin.png'), 0, 390, 32, 50, 2, 0.5, 2, true));
    this.stateMachine.addState('runRightGob',
      new Animation(AM.getAsset('./img/goblin.png'), 0, 455, 32, 50, 4, 0.25, 4, true));

  }

    update() {
      let yRange = Math.abs(this.game.player.y) + 50 >= Math.abs(this.y)
        && Math.abs(this.game.player.y) - 50 <= Math.abs(this.y);

      if(this.game.player.x < this.x && yRange) {
        this.stateMachine.setState('idleLeftGob');

      }else if(this.game.player.x > this.x && yRange) {

        this.stateMachine.setState('idleRightGob');
      } else if(this.game.player.y > this.y ){
        this.stateMachine.setState('idleDownGob');

      } else if(this.game.player.y  < this.y) {
        this.stateMachine.setState('idleUpGob');

      }
  }

  draw(ctx) {
    this.stateMachine.draw(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y);

  }
}

class Beholder extends Enemy {
  constructor(game, statemachine, x, y, w, h) {
    super(game, statemachine, 0, 0, 64, 64, x, y, w, h);
    this.stateMachine = new StateMachine();
    /**
     * BEHOLDER states
     */
    this.stateMachine.addState('idleDownBH', new Animation(
      AM.getAsset('./img/beholder.png'), 0, 0, 65, 65, 2, 0.5, 2, true));
    this.stateMachine.addState('idleLeftBH', new Animation(
      AM.getAsset('./img/beholder.png'), 0, 65, 65, 65, 2, 0.5, 2, true));
    this.stateMachine.addState('idleUpBH', new Animation(
      AM.getAsset('./img/beholder.png'), 0, 130, 65, 65, 2, 0.5, 2, true));
    this.stateMachine.addState('idleRightBH', new Animation(
      AM.getAsset('./img/beholder.png'), 0, 190, 60, 65, 2, 0.5, 2, true));
    this.stateMachine.addState('attackDownBH', new Animation(
      AM.getAsset('./img/beholder.png'), 0, 255, 63, 65, 3, 0.333, 3, true));
    this.stateMachine.addState('attackLeftBH', new Animation(
      AM.getAsset('./img/beholder.png'), 0, 315, 63, 65, 3, 0.333, 3, true));
    this.stateMachine.addState('attackUpBH', new Animation(
      AM.getAsset('./img/beholder.png'), 0, 385, 63, 65, 2, 0.5, 2, true));
    this.stateMachine.addState('attackRightBH', new Animation(
      AM.getAsset('./img/beholder.png'), 0, 450, 60, 65, 3, 0.333, 3, true));
  }

  update() {
    // TODO Check for collision
    let yRange = Math.abs(this.game.player.y) + 50 >= Math.abs(this.y)
      && Math.abs(this.game.player.y) - 50 <= Math.abs(this.y);

    if(this.game.player.x < this.x && yRange){
      this.stateMachine.setState('idleLeftBH');

    } else if(this.game.player.x > this.x && yRange){
      this.stateMachine.setState('idleRightBH');

    } else if(this.game.player.y > this.y){
      this.stateMachine.setState('idleDownBH');

    } else if( this.game.player.y  < this.y) {
      this.stateMachine.setState('idleUpBH');
    }

  }
  
  draw(ctx){
    this.stateMachine.draw(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y);

  }
}

const SPEED = 100;

class DonJon {
  constructor(gameEngine, spritesheet, x, y, w, h) {
    this.game = gameEngine;
    this.spritesheet = spritesheet;
    this.name = 'DonJon';
    this.sx = 0;
    this.sy = 66;
    this.sw = 32;
    this.sh = 64;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.bounding = new Rectangle(x + w/8, y + h/2 + 1, w - w/4, h/2 - 2);
    this.prevX = x;
    this.prevY = y;
    this.speed = 200; // in px/s
    this.health = 24;
    this.direction = 'S';
    this.stateMachine = new StateMachine();
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
    for (let i = 0; i < this.game.walls.length; i++) {
      let box1 = this.bounding;
      let box2 = this.game.walls[i].bounding;
      if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
        && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
        this.x = this.prevX;
        this.y = this.prevY;
      }
    }
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
        this.prevX = this.x;
        this.x += this.game.clockTick * SPEED;
      } else if (cursor.leftPressed) {
        this.stateMachine.setState('runLeftDJ');
        this.direction = 'W';
        this.prevX = this.x;
        this.x -= this.game.clockTick * SPEED;
      }
      if (cursor.upPressed) {
        this.stateMachine.setState('runUpDJ');
        this.direction = 'N';
        this.prevY = this.y;
        this.y -= this.game.clockTick * SPEED;
      } else if (cursor.downPressed) {
        this.stateMachine.setState('runDownDJ');
        this.direction = 'S';
        this.prevY = this.y;
        this.y += this.game.clockTick * SPEED;
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
      this.bounding.x = this.x + 1;
      this.bounding.y = this.y + this.h / 2 + 1;
    }
  }

  draw(ctx) {
    this.stateMachine.draw(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y);
    if (this.game.collisionDebug) {
      let prevStyle = ctx.strokeStyle;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(this.bounding.x - this.game.camera.x,
        this.bounding.y - this.game.camera.y, this.bounding.w, this.bounding.h);
      ctx.strokeStyle = prevStyle;
    }
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

  let center = { x: gameEngine.surfaceWidth / 2, y: gameEngine.surfaceHeight / 2 };
  for (let i = 0; i < level.tiles[0].length; i++) {
    for (let j = 0; j < level.tiles.length; j++) {
      let pos = { x: i * SIZE, y: j * SIZE };
      switch (level.tiles[j][i]) {
        case 'W':
          let wall = new Wall(gameEngine, AM.getAsset('./img/map.png'),
          pos.x, pos.y, SIZE, SIZE);
          stationary.push(wall);
          gameEngine.walls.push(wall);
          break;
        case 'F': tiles.push(new Dirt(gameEngine, AM.getAsset('./img/map.png'),
          pos.x, pos.y, SIZE, SIZE)); break;
        case 'End':
        case 'Start': stationary.push(new Staircase(
          gameEngine, AM.getAsset('./img/tilesheet.png'), pos.x, pos.y,
          SIZE, SIZE));
          don = new DonJon(gameEngine, AM.getAsset('./img/main_dude.png'), pos.x,
            pos.y - SIZE, SIZE, SIZE * 2);
          break;
      }
      for (let k = 0; k < powerups.length; k++) {
        if (level.tiles[j][i] === powerups[k].name) {
          tiles.push(new Dirt(gameEngine, AM.getAsset('./img/map.png'), pos.x,
            pos.y, SIZE, SIZE));
          powerupEntities.push(powerups[k].constructor(pos.x, pos.y));
        }
      }
      for (let k = 0; k < enemies.length; k++) {
        if (level.tiles[j][i] === enemies[k].name) {
          tiles.push(new Dirt(gameEngine, AM.getAsset('./img/map.png'), pos.x,
            pos.y, SIZE, SIZE));
          enemyEntities.push(enemies[k].constructor(pos.x, pos.y));
        }
      }
    }
  }

  let camera = new Camera(don);
  gameEngine.init(ctx, camera);
  gameEngine.start();

  gameEngine.addEntity(camera);

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

  gameEngine.addPlayer(don);

  console.log('Finished downloading assets');
});
