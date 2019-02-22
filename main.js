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
      // source from sheet
      index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,
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
  constructor(game, spritesheet, version, x, y, w, h) {
    super(game, spritesheet, 64 * (version % 4),
      64 * (1 + Math.floor(version / 4)), 64, 64, x, y, w, h);
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

class Ladder extends Tile {
  constructor(game, spritesheet, sound, x, y, w, h) {
    super(game, spritesheet, 128, 0, 64, 64, x, y, w, h);
    this.bounding = new Rectangle(x + 1, y + h/4, w - 2, h - h/4);
    this.left = false;
    this.sound = sound;
  }

  update() {
    if (this.game.player) {
    let box1 = this.game.player.bounding;
    let box2 = this.bounding;
    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
      if (this.left) {
        console.log('hit ladder');
        if (this.game.world.level > 0) {
          this.sound.play();
          this.game.setLevel(this.game.world.level - 1);
        }
        this.left = false;
      }
    } else {
      if (!this.left) {
        // Mark when the player leaves the bounding box of the ladder
        this.left = true;
        console.log('left ladder');
      }
    }
    }
  }
}

class Hole extends Tile {
  constructor(game, spritesheet, sound, x, y, w, h) {
    super(game, spritesheet, 64, 0, 64, 64, x, y, w, h);
    this.bounding = new Rectangle(x + 1, y + 1, w - 2, h - 1);
    this.sound = sound;
    this.left = false;
  }

  update() {
    let box1 = this.game.player.bounding;
    let box2 = this.bounding;
    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
      if (this.left) {
        console.log('hit hole');
        if (this.game.world.level < 12) {
          this.sound.play();
          this.game.setLevel(this.game.world.level + 1);
        }
        this.left = false;
      }
    } else {
      if (!this.left) {
        console.log('left hole');
        this.left = true;
      }
    }
  }
}

class Powerup {
  constructor(game, animation, sound, x, y) {
    this.game = game;
    this.animation = animation;
    this.sound = sound;
    this.x = x;
    this.y = y;
    this.bounding = new Rectangle(x, y, SIZE / 2, SIZE / 2);
    this.collided = false;
  }

  update() {
    if (this.game.player) {
      let box1 = this.game.player.bounding;
      let box2 = this.bounding;
      if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
        && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
        this.collided = true;
        this.sound.play();
      }
    }
  }

  draw(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y, 1);
  }
}

class HealthPotion extends Powerup {
  constructor(game, spritesheet, sound, x, y) {
    super(game, new Animation(spritesheet, 0, 0, 32, 32, 192, 0.167, 6, true),
      sound, x, y);
  }

  update() {
    super.update();
    if (this.collided) {
      this.game.player.currentHP = Math.min(this.game.player.currentHP + 8,
        this.game.player.maxHP);
      console.log('hit health potion. Current HP:', this.game.player.currentHP);
      this.game.entities.remove(this);
    }
  }
}

class LifeBuff extends Powerup {
  constructor(game, spritesheet, sound, x, y) {
    super(game, new Animation(spritesheet, 0, 0, 32, 32, 128, 0.25, 4, true),
      sound, x, y);
  }

  update() {
    super.update();
    if (this.collided) {
      this.game.player.maxHP += 1;
      console.log('hit life buff. Max HP:', this.game.player.maxHP);
      this.game.entities.remove(this);
    }
  }
}

class StrengthBuff extends Powerup {
  constructor(game, spritesheet, sound, x, y) {
    super(game, new Animation(spritesheet, 0, 0, 32, 32, 64, 0.5, 2, true),
      sound, x, y);
  }

  update() {
    super.update();
    if (this.collided) {
      this.game.player.attackDamage += 1;
      console.log('hit strength buff. Attack damage:',
        this.game.player.attackDamage);
      this.game.entities.remove(this);
    }
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

const MELEE = 30; // Distance to make a melee attack from

class Enemy {
  constructor(game, statemachine, x, y, w, h) {
    this.game = game;
    this.stateMachine = statemachine;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.prevX = x;
    this.prevY = y;
    this.damage = 1;
    this.isEnemy = true;
    this.canMove = true;
    this.bounding = new Rectangle(x, y, w, h);
    this.boundingXOffset = 0;
    this.boundingYOffset = 0;
    this.speed = SPEED * 0.75;
    this.attackDistance = 200;
    this.attackCooldown = 0;
    this.ranged = false;
    this.maxHP = 4;
    this.currentHP = this.maxHP;
  }

  update() {
    if (this.currentHP <= 0) {
      this.game.entities.remove(this);
    }
    // Check for collision with walls
    let that = this;
    this.game.walls.iterate(function (wall) {
      let box1 = that.bounding;
      let box2 = wall.bounding;
      if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
        && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
        that.x = that.prevX;
        that.y = that.prevY;
      }
    });
    // Check for collision with DonJon
    let box1 = this.bounding;
    let box2 = this.game.player.bounding;
    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
      this.x = this.prevX;
      this.y = this.prevY;
    }

    let yRange = Math.abs(this.game.player.y) + 30 >= Math.abs(this.y)
      && Math.abs(this.game.player.y) - 30 < Math.abs(this.y);
    let distance = cartesianDistance(this.game.player, this);

    if (this.attackCooldown > 0) {
      this.attackCooldown -= this.game.clockTick;
    } else {
      if ((!this.ranged && distance <= MELEE) ||
        (this.ranged && distance <= this.attackDistance)) {
        this.attack();
      } else if (distance > this.attackDistance) { // Face player
        if (this.game.player.x < this.x && yRange) {
          this.stateMachine.setState('idleLeft');
        } else if (this.game.player.x > this.x && yRange) {
          this.stateMachine.setState('idleRight');
        } else if (this.game.player.y > this.y) {
          this.stateMachine.setState('idleDown');
        } else if (this.game.player.y < this.y) {
          this.stateMachine.setState('idleUp');
        }
      } else if (this.canMove && distance <= this.attackDistance) {
        if (distance < 50 && this.y < this.game.player.y){
          this.stateMachine.setState('runDown');
          this.prevY = this.y;
          this.y += this.game.clockTick * this.speed;
        } else if (this.game.player.x <= this.x && yRange) {
          this.stateMachine.setState('runLeft');
          this.prevX = this.x;
          this.x -= this.game.clockTick * this.speed;
        } else if (this.game.player.x > this.x && yRange) {
          this.stateMachine.setState('runRight');
          this.prevX = this.x;
          this.x += this.game.clockTick * this.speed;
        } else if (this.game.player.y > this.y) {
          this.stateMachine.setState('runDown');
          this.prevY = this.y;
          this.y += this.game.clockTick * this.speed;
        } else if (this.game.player.y < this.y) {
          this.stateMachine.setState('runUp');
          this.prevY = this.y;
          this.y -= this.game.clockTick * this.speed;
        }
      }
    }
    this.bounding.x = this.x + this.boundingXOffset;
    this.bounding.y = this.y + this.boundingYOffset;
  }

  attack() {
    let yRange = Math.abs(this.game.player.y) + 30 >= Math.abs(this.y)
      && Math.abs(this.game.player.y) - 30 < Math.abs(this.y);
    let strike = null;
    if (this.game.player.x < this.x && yRange) {
      this.stateMachine.setState('idleLeft');
      strike = new EnemyStrike(this.game, this.x - 6,
        this.y, 'left', this.damage);
    } else if (this.game.player.x > this.x && yRange) {
      this.stateMachine.setState('idleRight');
      strike = new EnemyStrike(this.game, this.x - 52 + this.bounding.w,
        this.y, 'right', this.damage);
    } else if (this.game.player.y > this.y) {
      this.stateMachine.setState('idleDown');
      strike = new EnemyStrike(this.game, this.x, this.y, 'down', this.damage);
    } else if (this.game.player.y < this.y) {
      this.stateMachine.setState('idleUp');
      strike = new EnemyStrike(this.game, this.x, this.y, 'up', this.damage);
    }
    this.game.entities.add(strike);
    this.attackCooldown = 1;
  }

  draw(ctx) {
    this.stateMachine.draw(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y);
    if (this.game.collisionDebug) {
      let prevStyle = ctx.strokeStyle;
      ctx.strokeStyle = 'blue';
      ctx.strokeRect(this.bounding.x - this.game.camera.x,
        this.bounding.y - this.game.camera.y, this.bounding.w, this.bounding.h);
      ctx.strokeStyle = prevStyle;
    }
  }
}

class Goblin extends Enemy {
  constructor(game, spritesheet, x, y, w, h) {
    let statemachine = new StateMachine();
    super(game, statemachine, x, y, w, h);
    // this.speed = SPEED * 0.75;
    // this.attackDistance = 200;
    this.bounding = new Rectangle(x + 1, y + 16, 30, 40);
    this.boundingXOffset = 1;
    this.boundingYOffest = 16;
    statemachine.addState('idleDown',
      new Animation(spritesheet, 0, 0, 32, 64, 4, 0.25, 4, true));
    statemachine.addState('idleLeft',
      new Animation(spritesheet, 0, 64, 32, 64, 2, 0.5, 2, true));
    statemachine.addState('idleUp',
      new Animation(spritesheet, 0, 128, 32, 64, 2, 0.5, 2, true));
    statemachine.addState('idleRight',
      new Animation(spritesheet, 0, 192, 32, 64, 3, 0.333, 3, true));
    statemachine.addState('runDown',
      new Animation(spritesheet, 0, 256, 32, 64, 2, 0.5, 2, true));
    statemachine.addState('runLeft',
      new Animation(spritesheet, 0, 320, 32, 64, 4, 0.25, 4, true));
    statemachine.addState('runUp',
      new Animation(spritesheet, 0, 384, 32, 64, 2, 0.5, 2, true));
    statemachine.addState('runRight',
      new Animation(spritesheet, 0, 448, 32, 64, 4, 0.25, 4, true));
  }
}

class Beholder extends Enemy {
  constructor(game, spritesheet, x, y, w, h) {
    let statemachine = new StateMachine();
    super(game, statemachine, x, y, w, h);
    this.attackDistance = 300;
    this.canMove = false;
    this.ranged = true;
    this.bounding = new Rectangle(x + 1, y + 1, 61, 57);
    this.boundingXOffset = 1;
    this.boundingYOffset = 1;
    statemachine.addState('idleDown', new Animation(
      spritesheet, 0, 0, 64, 64, 2, 0.5, 2, true));
    statemachine.addState('idleLeft', new Animation(
      spritesheet, 0, 64, 64, 64, 2, 0.5, 2, true));
    statemachine.addState('idleUp', new Animation(
      spritesheet, 0, 128, 64, 64, 2, 0.5, 2, true));
    statemachine.addState('idleRight', new Animation(
      spritesheet, 0, 192, 64, 64, 2, 0.5, 2, true));
    statemachine.addState('attackDown', new Animation(
      spritesheet, 0, 256, 64, 64, 3, 0.333, 3, true));
    statemachine.addState('attackLeft', new Animation(
      spritesheet, 0, 320, 64, 64, 3, 0.333, 3, true));
    statemachine.addState('attackUp', new Animation(
      spritesheet, 0, 384, 64, 64, 2, 0.5, 2, true));
    statemachine.addState('attackRight', new Animation(
      spritesheet, 0, 448, 64, 64, 3, 0.333, 3, true));
  }

  attack() {
    let yRange = Math.abs(this.game.player.y) + 30 >= Math.abs(this.y)
      && Math.abs(this.game.player.y) - 30 < Math.abs(this.y);
    let shot = null;
    if (this.game.player.x < this.x && yRange) {
      this.stateMachine.setState('attackLeft');
      shot = new BeholderShot(this.game, this.x, this.y, 'left', this.damage);
    } else if (this.game.player.x > this.x && yRange) {
      this.stateMachine.setState('attackRight');
      shot = new BeholderShot(this.game, this.x + this.bounding.w,
        this.y, 'right', this.damage);
    } else if (this.game.player.y > this.y) {
      this.stateMachine.setState('attackDown');
      shot = new BeholderShot(this.game, this.x, this.y + this.bounding.h,
        'down', this.damage);
    } else if (this.game.player.y < this.y) {
      this.stateMachine.setState('attackUp');
      shot = new BeholderShot(this.game, this.x, this.y, 'up', this.damage);
    }
    this.game.entities.add(shot);
    this.attackCooldown = 1;
  }
}

class BeholderShot {
  constructor(game, x, y, direction, damage) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.speed = 150;
    this.damage = damage;
    this.bounding = new Rectangle(x, y, 32, 32);
    this.cooldown = 3;
    this.direction = direction;
    switch (direction) {
      case 'up':
        this.animation = new Animation(AM.getAsset('./img/shot.png'),
          0, 0, 32, 32, 3, 0.333, 3, true);
        break;
      case 'right':
        this.animation = new Animation(AM.getAsset('./img/shot.png'),
          0, 32, 32, 32, 3, 0.333, 3, true);
        break;
      case 'down':
        this.animation = new Animation(AM.getAsset('./img/shot.png'),
          0, 64, 32, 32, 3, 0.333, 3, true);
        break;
      case 'left':
        this.animation = new Animation(AM.getAsset('./img/shot.png'),
          0, 96, 32, 32, 3, 0.333, 3, true);
        break;
    }
  }

  update() {
    this.cooldown  -= this.game.clockTick;
    if (this.cooldown <= 0) {
      this.game.entities.remove(this);
    } else {
      let box1 = this.bounding;
      let box2 = this.game.player.bounding;
      if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
        && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
        this.game.player.currentHP -= this.damage;
        this.game.entities.remove(this);
      }
      switch (this.direction) {
        case 'up':
          this.y -= this.speed * this.game.clockTick;
          this.bounding.y = this.y;
          break;
        case 'down':
          this.y += this.speed * this.game.clockTick;
          this.bounding.y = this.y;
          break;
        case 'right':
          this.x += this.speed * this.game.clockTick;
          this.bounding.x = this.x;
          break;
        case 'left':
          this.x -= this.speed * this.game.clockTick;
          this.bounding.x = this.x;
          break;
      }
    }
  }

  draw(ctx){
    this.animation.drawFrame(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y);
  }
}

class Wraith extends Enemy {
  constructor(game, spritesheet, x, y, w, h) {
    let statemachine = new StateMachine();
    super(game, statemachine, x, y, w, h);
    this.attackDistance = 150;
    this.bounding = new Rectangle(x + 1, y + 1, 30, 44);
    this.boundingXOffset = 1;
    this.boundingYOffset = 1;
    statemachine.addState('idleDown', new Animation(spritesheet, 0, 0, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('runDown', new Animation(spritesheet, 0, 0, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('idleLeft', new Animation(spritesheet, 0, 64, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('runLeft', new Animation(spritesheet, 0, 64, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('idleUp', new Animation(spritesheet, 0, 128, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('runUp', new Animation(spritesheet, 0, 128, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('idleRight', new Animation(spritesheet, 0, 192, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('runRight', new Animation(spritesheet, 0, 192, 32, 64,
      2, 0.5, 2, true));
  }
}

class Gargoyle extends Enemy {
  constructor(game, spritesheet, x, y, w, h) {
    let statemachine = new StateMachine();
    super(game, statemachine, x, y, w, h);
    this.attackDistance = 100;
    this.bounding = new Rectangle(x + 4, y + 2, 25, 45);
    this.boundingXOffset = 4;
    this.boundingYOffest = 2;
    this.canMove = false;
    statemachine.addState('idleDown',
      new Animation(spritesheet, 0, 0, 32, 64, 1, 1, 1, true));
    statemachine.addState('idleLeft',
      new Animation(spritesheet, 0, 64, 32, 64, 1, 1, 1, true));
    statemachine.addState('idleUp',
      new Animation(spritesheet, 0, 128, 32, 64, 1, 1, 1, true));
    statemachine.addState('idleRight',
      new Animation(spritesheet, 0, 192, 32, 64, 1, 1, 1, true));
    statemachine.addState('attackDown',
      new Animation(spritesheet, 0, 256, 32, 64, 2, 0.5, 2, true));
    statemachine.addState('attackLeft',
      new Animation(spritesheet, 0, 320, 32, 64, 3, 0.333, 3, true));
    statemachine.addState('attackUp',
      new Animation(spritesheet, 0, 384, 32, 64, 2, 0.5, 2, true));
    statemachine.addState('attackRight',
      new Animation(spritesheet, 0, 448, 32, 64, 3, 0.333, 3, true));
  }

  update() {
    super.update();
    let distance = cartesianDistance(this, this.game.player);
    if (distance <= this.attackDistance) {
      if (this.game.player.y < this.y) {
        this.stateMachine.setState('attackUp');
      } else if (this.game.player.x < this.x){
        this.stateMachine.setState('attackLeft');
      } else if (this.game.player.x > this.x){
        this.stateMachine.setState('attackRight');
      } else if (this.game.player.y > this.y){
        this.stateMachine.setState('attackDown');
      }
    }
  }
}

class Dragon extends Enemy {
  constructor(game, spritesheet, x, y, w, h) {
    let statemachine = new StateMachine();
    // adjust x and y to center dragon in final level
    super(game, statemachine, x - 75, y - 22, w, h);
    this.canMove = false;
    this.bounding = new Rectangle(x - 11, y - 22, 233, 184);
    this.boundingXOffset = 11;
    this.boundingYOffset = 22;
    statemachine.addState('idleDragon',
      new Animation(spritesheet, 0, 0, 256, 256, 2, 0.5, 2, true));
    statemachine.addState('jumpDragon',
      new Animation(spritesheet, 0, 256, 256, 256, 6, 0.166, 6, true));
    statemachine.addState('stompLeftDragon',
      new Animation(spritesheet, 0, 512, 256, 256, 4, 0.25, 4, true));
    statemachine.addState('stompRightDragon',
      new Animation(spritesheet, 0, 768, 256, 256, 4, 0.25, 4, true));
    statemachine.addState('readyFireDragon',
      new Animation(spritesheet, 0, 1024, 256, 256, 3, 0.333, 3, true));
    statemachine.addState('headWestDragon',
      new Animation(spritesheet, 0, 1280, 256, 256, 3, 0.333, 3, true));
    statemachine.addState('headEastDragon',
      new Animation(spritesheet, 0, 1536, 256, 256, 3, 0.333, 3, true));
    this.stateMap = new Map();
    this.stateMap.set(1, 'jumpDragon');
    this.stateMap.set(2, 'stompLeftDragon');
    this.stateMap.set(3, 'stompRightDragon');
    this.stateMap.set(4, 'readyFireDragon');
    this.stateMap.set(5, 'headWestDragon');
    this.stateMap.set(6, 'headEastDragon');
  }

  getStateDragon(){
    return this.stateMachine.setState(this.stateMap.get(randInt(6)));
  }

  update(){
    super.update();

//    if(this.distance() < 200) {
//     this.stateMachine.setState('stompLeftDragon');
//    } else  if( this.distance() < 150 ) {
//      this.stateMachine.setState('stompRightDragon');
//    } else if ( this.distance() < 100) {
//      this.stateMachine.setState('readyFireDragon');
//    } else if ( this.distance() < 80) {
//      this.stateMachine.setState('readyFireDragon');
//    } else if ( this.distance() < 60) {
//      this.stateMachine.setState('headWestDragon');
//    } else if ( this.distance() < 40) {
//      this.stateMachine.setState('headEastDragon');
//    } else {
//      // this.stateMachine.setState('idleDragon');
//      this.stateMachine.setState('headEastDragon');
//    }
  }
}

class BossAttack extends Enemy {
  constructor(game, statemachine, x, y, w, h) {
    super(game, statemachine, 0, 0, 256, 220, x, y, w, h);
    this.stateMachine = new StateMachine();
    this.stateMachine.addState('stomp1',
      new Animation(AM.getAsset('./bossAttack.png'), 0 , 0, 256, 220, 4, 0.25, 4, true));
    this.stateMachine.addState('stomp2',
      new Animation(AM.getAsset('./bossAttack.png'), 0 , 220, 256, 220, 4, 0.25, 4, true));
    this.stateMachine.addState('stomp3',
      new Animation(AM.getAsset('./bossAttack.png'), 0 , 440, 256, 220, 4, 0.25, 4, true));
    this.stateMachine.addState('fire1',
      new Animation(AM.getAsset('./bossAttack.png'), 0 , 660, 256, 220, 3, 0.333, 3, true));
    this.stateMachine.addState('fire2',
      new Animation(AM.getAsset('./bossAttack.png'), 0 , 880, 256, 220, 3, 0.333, 3, true));
    this.stateMachine.addState('fire3',
      new Animation(AM.getAsset('./bossAttack.png'), 0 , 1100, 256, 220, 3, 0.333, 3, true));
  }
  update(){

  }

  draw(ctx){
    this.stateMachine.draw(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y);
  }
}


const SPEED = 100;

class DonJon {
  constructor(gameEngine, spritesheet, sounds, x, y, w, h) {
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
    this.god = false;
    this.godTimer = 0;
    this.bounding = new Rectangle(x + w/8, y + h/2 + 1, w - w/4, h/2 - 2);
    this.prevX = x;
    this.prevY = y;
    this.speed = 200; // in px/s
    this.maxHP= 24;
    this.currentHP = 24;
    this.attackDamage = 1;
    this.direction = 'S';
    this.soundWalk = sounds.walk;
    this.soundWalk.loop = true;
    this.soundSwing = sounds.swing;
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
    this.stateMachine.addState('idleDownDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0, 0, 32, 64, 2, 0.5, 2, true));
    this.stateMachine.addState('idleLeftDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0 ,64, 32, 64, 2, 0.5, 2, true));
    this.stateMachine.addState('idleUpDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0, 128, 32, 64, 2, 0.5, 2, true));
    this.stateMachine.addState('idleRightDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0, 192, 32, 64, 2, 0.5, 2, true));
    this.stateMachine.addState('runDownDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0, 256, 32, 64, 2, 0.167, 2, true));
    this.stateMachine.addState('runLeftDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0 ,320, 32, 64, 6, 0.167, 6, true));
    this.stateMachine.addState('runUpDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0 ,384, 32, 64, 2, 0.167, 2, true));
    this.stateMachine.addState('runRightDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0, 448, 32, 64, 6, 0.167, 6, true));
    this.stateMachine.addState('attackDownDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0, 512, 32, 64, 5, 0.2, 5, true));
    this.stateMachine.addState('attackLeftDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0, 576, 32, 64, 4, 0.25, 4, true));
    this.stateMachine.addState('attackUpDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0, 640, 32, 64, 6, 0.167, 6, true));
    this.stateMachine.addState('attackRightDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 0, 704, 32, 64, 4, 0.25, 4, true));
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.bounding.x = x + this.w/8;
    this.bounding.y = y + this.h/2 + 1;
  }

  update() {
    let that = this;
    this.game.entities.iterate(function (enemy) {
      if(enemy.isEnemy) {
        let box1 = that.bounding;
        let box2 = enemy.bounding;
        if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
          && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y
          && !that.god) {
          //that.currentHP -= enemy.damage;
          that.x = that.prevX;
          that.y = that.prevY;
          that.god = true;
          that.godTimer = 5;
        }
      }
    });
    if (that.god) {
      that.godTimer -= that.game.clockTick;
      if (that.godTimer <= 0) {
        that.god = false;
      }
    }
    this.game.walls.iterate(function (wall) {
      let box1 = that.bounding;
      let box2 = wall.bounding;
      if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
        && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
        that.x = that.prevX;
        that.y = that.prevY;
      }
    });
    if (mouseCooldown) {
      if (mouseValue) {
//        if(this.god) {
          let strike = null;
          switch(this.direction) {
            case 'N':
              this.stateMachine.setState('attackUpDJG');
              strike = new PlayerStrike(this.game, this.x - 16, this.y - 10, 'up', this.attackDamage);
              break;
            case 'E':
              this.stateMachine.setState('attackRightDJG');
              strike = new PlayerStrike(this.game, this.x - 20, this.y, 'right', this.attackDamage);
              break;
            case 'S':
              this.stateMachine.setState('attackDownDJG');
              strike = new PlayerStrike(this.game, this.x - 16, this.y + 10, 'down', this.attackDamage);
              break;
            case 'W':
              this.stateMachine.setState('attackLeftDJG');
              strike = new PlayerStrike(this.game, this.x - 10, this.y, 'left', this.attackDamage);
              break;
          }
          this.game.entities.add(strike);
//        } else {
//          switch(this.direction) {
//            case 'N': this.stateMachine.setState('attackUpDJ'); break;
//            case 'E': this.stateMachine.setState('attackRightDJ'); break;
//            case 'S': this.stateMachine.setState('attackDownDJ'); break;
//            case 'W': this.stateMachine.setState('attackLeftDJ'); break;
//          }
//        }
        this.soundSwing.play();
        if (!this.soundWalk.paused) {
          this.soundWalk.pause();
        }
        mouseValue = false;
      }
    } else {
      if (cursor.rightPressed) {
        if(this.god) {
          this.stateMachine.setState('runRightDJG');
        } else {
          this.stateMachine.setState('runRightDJ');
        }
        this.direction = 'E';
        this.prevX = this.x;
        this.x += this.game.clockTick * SPEED;
      } else if (cursor.leftPressed) {
        if(this.god) {
          this.stateMachine.setState('runLeftDJG');
        } else {
          this.stateMachine.setState('runLeftDJ');
        }
        this.direction = 'W';
        this.prevX = this.x;
        this.x -= this.game.clockTick * SPEED;
      }
      if (cursor.upPressed) {
        if(this.god) {
          this.stateMachine.setState('runUpDJG');
        } else {
          this.stateMachine.setState('runUpDJ');
        }
        this.direction = 'N';
        this.prevY = this.y;
        this.y -= this.game.clockTick * SPEED;
      } else if (cursor.downPressed) {
        if(this.god) {
          this.stateMachine.setState('runDownDJG');
        } else {
          this.stateMachine.setState('runDownDJ');
        }
        this.direction = 'S';
        this.prevY = this.y;
        this.y += this.game.clockTick * SPEED;
      }
      if (!cursor.upPressed && !cursor.downPressed && !cursor.rightPressed &&
        !cursor.leftPressed) {
        this.soundWalk.pause();
        if(this.god) {
          switch(this.direction) {
            case 'N': this.stateMachine.setState('idleUpDJG'); break;
            case 'E': this.stateMachine.setState('idleRightDJG'); break;
            case 'S': this.stateMachine.setState('idleDownDJG'); break;
            case 'W': this.stateMachine.setState('idleLeftDJG'); break;
          }
        } else {
          switch(this.direction) {
            case 'N': this.stateMachine.setState('idleUpDJ'); break;
            case 'E': this.stateMachine.setState('idleRightDJ'); break;
            case 'S': this.stateMachine.setState('idleDownDJ'); break;
            case 'W': this.stateMachine.setState('idleLeftDJ'); break;
          }
        }
      } else if(this.soundWalk.paused) {
        this.soundWalk.play();
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

class Strike {
  constructor(gameEngine, x, y, direction) {
    this.game = gameEngine;
    this.x = x;
    this.y = y;
    this.bounding = new Rectangle(x, y, 64, 64);
    this.cooldown = 1;
    switch (direction) {
      case 'up': this.animation = new Animation(
        AM.getAsset('./img/Strike.png'), 0, 0, 64, 64, 5, 0.2, 5, true);
        this.bounding.y -= 40;
        break;
      case 'right': this.animation = new Animation(
        AM.getAsset('./img/Strike.png'), 0, 64, 64, 64, 5, 0.2, 5, true);
        this.bounding.x += 49;
        break;
      case 'down': this.animation = new Animation(
        AM.getAsset('./img/Strike.png'), 0, 128, 64, 64, 5, 0.2, 5, true);
        this.bounding.y += 49;
        break;
      case 'left': this.animation = new Animation(
        AM.getAsset('./img/Strike.png'), 0, 192, 64, 64, 5, 0.2, 5, true);
        this.bounding.x -= 49;
        break;
    }
  }

  update() {
    this.cooldown -= this.game.clockTick;
    if (this.cooldown <= 0) {
      this.game.entities.remove(this);
    }
  }

  draw(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y);
    if (this.game.collisionDebug) {
      let prevStyle = ctx.strokeStyle;
      ctx.strokeStyle = 'grey';
      ctx.strokeRect(this.bounding.x - this.game.camera.x,
        this.bounding.y - this.game.camera.y, this.bounding.w, this.bounding.h);
      ctx.strokeStyle = prevStyle;
    }
  }
}

class EnemyStrike extends Strike {
  constructor(gameEngine, x, y, direction, damage) {
    super(gameEngine, x, y, direction);
    this.hit = false;
    this.damage = damage;
  }

  update() {
    super.update();
    let box1 = this.bounding;
    let box2 = this.game.player.bounding;
    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y
      && !this.hit) {
      this.game.player.currentHP -= this.damage;
      this.hit = true;
    }
  }
}

class PlayerStrike extends Strike {
  constructor(gameEngine, x, y, direction, damage) {
    super(gameEngine, x, y, direction);
    this.hit = false;
    this.damage = damage;
  }

  update() {
    super.update();
    let that = this;
    this.game.entities.iterate(function (entity) {
      if (entity.isEnemy) {
        let box1 = that.bounding;
        let box2 = entity.bounding;
        if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
          && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y
          && !that.hit) {
          entity.currentHP -= that.damage;
          that.hit = true;
        }
      }
    });
  }
}

AM.queueDownload('./img/potion.png');
AM.queueDownload('./img/life.png');
AM.queueDownload('./img/strength.png');
AM.queueDownload('./img/map.png');
AM.queueDownload('./img/map2.png');
AM.queueDownload('./img/goblin.png');
AM.queueDownload('./img/beholder.png');
AM.queueDownload('./img/main_dude.png');
AM.queueDownload('./img/main_dude_god.png');
AM.queueDownload('./snd/background.mp3');
AM.queueDownload('./snd/walking_down_stairs.mp3');
AM.queueDownload('./snd/walking_up_stairs.mp3');
AM.queueDownload('./snd/footsteps.wav');
AM.queueDownload('./snd/swing.wav');
AM.queueDownload('./snd/life.wav');
AM.queueDownload('./snd/health.wav');
AM.queueDownload('./snd/strength.wav');
AM.queueDownload('./img/shot.png');
AM.queueDownload('./img/Strike.png');
AM.queueDownload('./img/wraith.png');
AM.queueDownload('./img/gargoyle.png');
AM.queueDownload('./img/dragon.png');
AM.queueDownload('./img/bossAttack.png');


AM.downloadAll(function () {

  const canvas = document.getElementById('gameWorld');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false; // Turn off anti-aliasing

  const gameEngine = new GameEngine();
  const background = AM.getAsset('./snd/background.mp3');
  gameEngine.init(ctx, background);

  const powerups = [
    {
      name: 'pHealth',
      constructor: function (x, y) {
        return new HealthPotion(gameEngine, AM.getAsset('./img/potion.png'),
          AM.getAsset('./snd/health.wav'), x, y);
      },
      number: 1
    },
    {
      name: 'pLife',
      constructor: function (x, y) {
        return new LifeBuff(gameEngine, AM.getAsset('./img/life.png'),
          AM.getAsset('./snd/life.wav'), x, y);
      },
      number: 1
    },
    {
      name: 'pStrength',
      constructor: function (x, y) {
        return new StrengthBuff(gameEngine, AM.getAsset('./img/strength.png'),
          AM.getAsset('./snd/strength.wav'), x, y);
      },
      number: 1
    }
  ];

  const enemies = [
    {
      name: 'eGoblin',
      constructor: function (x, y) {
        return new Goblin(gameEngine, AM.getAsset('./img/goblin.png'), x, y,
          SIZE / 2, SIZE);
      },
      width: 1,
      height: 2,
      number: [3, 5, 7, 7, 7, 7, 5, 3, 0, 0, 0, 0]
    },
    {
      name: 'eBeholder',
      constructor: function (x, y) {
        return new Beholder(gameEngine, AM.getAsset('./img/beholder.png'), x, y,
          SIZE, SIZE);
      },
      width: 2,
      height: 2,
      number: [2, 2, 2, 2, 3, 4, 3, 2, 2, 0, 0, 0, 0]
    },
    {
      name: 'eWraith',
      constructor: (x, y) => {
        return new Wraith(gameEngine, AM.getAsset('./img/wraith.png'), x, y,
          SIZE / 2, SIZE);
      },
      width: 1,
      height: 2,
      number: [7, 7, 7, 7, 3, 4, 3, 2, 2, 0, 0, 0, 0]
    },
    {
      name: 'eGargoyle',
      constructor: (x, y) => {
        return new Gargoyle(gameEngine, AM.getAsset('./img/gargoyle.png'), x, y,
          SIZE / 2, SIZE);
      },
      width: 1,
      height: 2,
      number: [2, 2, 2, 2, 3, 4, 3, 2, 2, 0, 0, 0, 0]
    }
    ,
    {
      name: 'eDragon',
      constructor: (x, y) => {
        return new Dragon(gameEngine, AM.getAsset('./img/dragon.png'), x, y,
          SIZE * 2, SIZE * 2);
      },
      width: 4,
      height: 4,
      number: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }

  ];

  let world = new World(13, powerups, enemies, AM);
  gameEngine.setWorld(world);
  gameEngine.setLevel(0);
  gameEngine.start();

  console.log('Finished downloading assets');
});
