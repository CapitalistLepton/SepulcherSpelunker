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

  contains(x, y) {
    return (x >= this.x && x <= this.x + this.w && y >= this.y &&
      y <= this.y + this.h);
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

class Statue extends Tile {
  constructor(game, spritesheet, x, y, w, h, direction) {
    let row = 0;
    switch (direction) {
      case 'N':
        row = 0;
        break;
      case 'E':
        row = 64;
        break;
      case 'S':
        row = 128;
        break;
      case 'W':
        row = 192;
        break;
    }
    super(game, spritesheet, 0, row, 64, 64, x, y, w, h);
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
    this.game.sounds.add(this.sound);
  }

  update() {
    if (this.game.player) {
    let box1 = this.game.player.bounding;
    let box2 = this.bounding;
    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
      if (this.left) {
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
    this.game.sounds.add(this.sound);
  }

  update() {
    let box1 = this.game.player.bounding;
    let box2 = this.bounding;
    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
      if (this.left) {
        if (this.game.world.level < 12) {
          this.sound.play();
          this.game.setLevel(this.game.world.level + 1);
        }
        this.left = false;
      }
    } else {
      if (!this.left) {
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
    this.game.sounds.add(sound);
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
        this.game.entities.remove(this);
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
      this.game.player.currentHP = this.game.player.maxHP;
    }
  }
}

class ManaPotion extends Powerup {
  constructor(game, spritesheet, sound, x, y) {
    super(game, new Animation(spritesheet, 0, 0, 32, 32, 192, 0.167, 6, true),
      sound, x, y);
  }

  update() {
    super.update();
    if (this.collided) {
      this.game.player.currentMana = this.game.player.maxMana;
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

const MELEE = 50; // Distance to make a melee attack from
const GOD_COOLOFF = 1.5;

class Enemy {
  constructor(game, statemachine, x, y, w, h, level) {
    this.game = game;
    this.stateMachine = statemachine;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.prevX = x;
    this.prevY = y;
    this.damage = Math.floor(1 + level / 4);
    this.isEnemy = true;
    this.canMove = true;
    this.collidesWithWalls = true;
    this.bounding = new Rectangle(x, y, w, h);
    this.boundingXOffset = 0;
    this.boundingYOffset = 0;
    this.hitSound = AM.getAsset('./snd/goblin.wav');
    this.game.sounds.add(this.hitSound);
    this.speed = SPEED * 0.75;
    this.attackDistance = 300;
    this.attackCooldown = 0;
    this.ranged = false;
    this.maxHP = 4 + level;
    this.currentHP = this.maxHP;
    this.points = 5;

  }

  update() {
    if (this.currentHP <= 0) {
      this.game.entities.remove(this);
      this.game.player.score += this.points;
    }
    // Check for collision with walls
    if (this.collidesWithWalls) {
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
    }
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
    if (this.hitCooldown > 0) {
      this.hitCooldown -= this.game.clockTick;
      let state = this.stateMachine.getStateName();
      if (!state.includes('Hurt')) {
        this.stateMachine.setState(state + 'Hurt');
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
  constructor(game, spritesheet, x, y, w, h, level) {
    let statemachine = new StateMachine();
    let hurtSprite = AM.getAsset('./img/goblind.png');
    super(game, statemachine, x, y, w, h, level);
    this.bounding = new Rectangle(x + w/8, y - h/2 * 2 + 10, w - w/4, h/2);
    this.speed = SPEED * 0.5;
    this.boundingXOffset = 1;
    this.boundingYOffest = 16;
    this.goalPoint = null;
    this.hitSound = AM.getAsset('./snd/goblin.wav');
    this.points = 5;
    this.game.sounds.add(this.hitSound);
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

    statemachine.addState('idleDownHurt',
      new Animation(hurtSprite, 0, 0, 32, 64, 4, 0.25, 4, true));
    statemachine.addState('idleLeftHurt',
      new Animation(hurtSprite, 0, 64, 32, 64, 2, 0.5, 2, true));
    statemachine.addState('idleUpHurt',
      new Animation(hurtSprite, 0, 128, 32, 64, 2, 0.5, 2, true));
    statemachine.addState('idleRightHurt',
      new Animation(hurtSprite, 0, 192, 32, 64, 3, 0.333, 3, true));
    statemachine.addState('runDownHurt',
      new Animation(hurtSprite, 0, 256, 32, 64, 2, 0.5, 2, true));
    statemachine.addState('runLeftHurt',
      new Animation(hurtSprite, 0, 320, 32, 64, 4, 0.25, 4, true));
    statemachine.addState('runUpHurt',
      new Animation(hurtSprite, 0, 384, 32, 64, 2, 0.5, 2, true));
    statemachine.addState('runRightHurt',
      new Animation(hurtSprite, 0, 448, 32, 64, 4, 0.25, 4, true));
  }

  update() {
    if (this.currentHP <= 0) {
      this.game.entities.remove(this);
      this.game.player.score += this.points;
    }
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
      if (distance <= MELEE) {
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
      } else if (distance <= this.attackDistance) {
        /*
         * Use A* to find a path and recalculate A* everytime the first point
         * is reached.
         */
        let currentX = this.x + this.w / 2;
        let currentY = this.y + this.h / 2;
        if (!this.goalPoint) { // Hit goal, recalculate A*
          // Divide by 32 since there 4 squares per tile in A* map
          let pathStart = new Point(Math.floor(currentX / 32),
            Math.floor(currentY / 32));
          let endX = this.game.player.bounding.x +
            this.game.player.bounding.w / 2;
          let endY = this.game.player.bounding.y +
            this.game.player.bounding.h / 2;
          let pathEnd = new Point(Math.floor(endX / 32), Math.floor(endY / 32));
          let level = this.game.world.starLevel();
          let path = aStar(level, pathStart, pathEnd);
          let point = path[path.length - 2]; // Get next point in path
          this.goalPoint = new Rectangle(point.x, point.y, 16, 16);
        } else {
          this.prevX = this.x;
          this.prevY = this.y;
          let maxX = this.goalPoint.x + this.goalPoint.w;
          let maxY = this.goalPoint.y + this.goalPoint.h;
          if (maxY > currentY && this.goalPoint.y > currentY) {
            this.y += this.speed * this.game.clockTick;
            this.stateMachine.setState('runDown');
          } else if (maxY < currentY && this.goalPoint.y < currentY) {
            this.y -= this.speed * this.game.clockTick;
            this.stateMachine.setState('runUp');
          }
          if (maxX > currentX && this.goalPoint.x > currentX) {
            this.x += this.speed * this.game.clockTick;
            this.stateMachine.setState('runRight');
          } else if (maxX < currentX && this.goalPoint.x < currentX) {
            this.x -= this.speed * this.game.clockTick;
            this.stateMachine.setState('runLeft');
          }
          if (this.goalPoint.contains(currentX, currentY)) {
            this.goalPoint = null;
          }
        }
      }
    }

    if (this.hitCooldown > 0) {
      this.hitCooldown -= this.game.clockTick;
      let state = this.stateMachine.getStateName();
      if (!state.includes('Hurt')) {
        this.stateMachine.setState(state + 'Hurt');
      }
    }
    this.bounding.x = this.x + this.boundingXOffset;
    this.bounding.y = this.y + this.boundingYOffest;
  }

  draw(ctx) {
    super.draw(ctx);
    if (this.game.collisionDebug && this.goalPoint) {
      let prevStyle = ctx.strokeStyle;
      ctx.strokeStyle = 'yellow';
      ctx.strokeRect(this.goalPoint.x - this.game.camera.x,
        this.goalPoint.y - this.game.camera.y, this.goalPoint.w, this.goalPoint.h);
      ctx.strokeStyle = prevStyle;
    }
  }
}
class Beholder extends Enemy {
  constructor(game, spritesheet, x, y, w, h, level) {
    let statemachine = new StateMachine();
    super(game, statemachine, x, y, w, h, level);
    this.attackDistance = 300;
    this.canMove = false;
    this.ranged = true;
    this.bounding = new Rectangle(x + 1, y + 1, 61, 57);
    this.boundingXOffset = 1;
    this.boundingYOffset = 1;
    this.hitSound = AM.getAsset('./snd/wraith.wav');
    this.shootSound = AM.getAsset('./snd/beholder_shoot.wav');
    this.game.sounds.add(this.hitSound);
    this.game.sounds.add(this.shootSound);
    this.points = 20;
    let hurtSprite = AM.getAsset('./img/beholderd.png');
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

    statemachine.addState('idleDownHurt', new Animation(
      hurtSprite, 0, 0, 64, 64, 2, 0.5, 2, true));
    statemachine.addState('idleLeftHurt', new Animation(
      hurtSprite, 0, 64, 64, 64, 2, 0.5, 2, true));
    statemachine.addState('idleUpHurt', new Animation(
      hurtSprite, 0, 128, 64, 64, 2, 0.5, 2, true));
    statemachine.addState('idleRightHurt', new Animation(
      hurtSprite, 0, 192, 64, 64, 2, 0.5, 2, true));
    statemachine.addState('attackDownHurt', new Animation(
      hurtSprite, 0, 256, 64, 64, 3, 0.333, 3, true));
    statemachine.addState('attackLeftHurt', new Animation(
      hurtSprite, 0, 320, 64, 64, 3, 0.333, 3, true));
    statemachine.addState('attackUpHurt', new Animation(
      hurtSprite, 0, 384, 64, 64, 2, 0.5, 2, true));
    statemachine.addState('attackRightHurt', new Animation(
      hurtSprite, 0, 448, 64, 64, 3, 0.333, 3, true));
  }

  attack() {
    let yRange = Math.abs(this.game.player.y) + 30 >= Math.abs(this.y)
      && Math.abs(this.game.player.y) - 30 < Math.abs(this.y);
    let shot = null;
    if (this.game.player.x < this.x && yRange) {
      this.stateMachine.setState('attackLeft');
      shot = new BeholderShot(this.game, this.x, this.y + this.h / 4, 'left', this.damage);
    } else if (this.game.player.x > this.x && yRange) {
      this.stateMachine.setState('attackRight');
      shot = new BeholderShot(this.game, this.x + this.bounding.w,
        this.y + this.h / 4, 'right', this.damage);
    } else if (this.game.player.y > this.y) {
      this.stateMachine.setState('attackDown');
      shot = new BeholderShot(this.game, this.x + this.w / 4, this.y + this.bounding.h,
        'down', this.damage);
    } else if (this.game.player.y < this.y) {
      this.stateMachine.setState('attackUp');
      shot = new BeholderShot(this.game, this.x + this.w / 4, this.y, 'up', this.damage);
    }
    this.game.entities.add(shot);
    this.shootSound.play();
    this.attackCooldown = 2;
  }
}

class Projectile {
  constructor(game, animation, x, y, direction, damage) {
    this.game = game;
    this.animation = animation;
    this.x = x;
    this.y = y;
    this.speed = 150;
    this.damage = damage;
    this.bounding = new Rectangle(x, y, 32, 32);
    this.cooldown = 3;
    this.direction = direction;
  }

  update() {
    this.cooldown  -= this.game.clockTick;
    if (this.cooldown <= 0) {
      this.game.entities.remove(this);
    } else {
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

  draw(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx,
      this.x - this.game.camera.x, this.y - this.game.camera.y);
    if (this.game.collisionDebug) {
      let prevStyle = ctx.strokeStyle;
      ctx.strokeStyle = 'lightblue';
      ctx.strokeRect(this.bounding.x - this.game.camera.x,
        this.bounding.y - this.game.camera.y, this.bounding.w, this.bounding.h);
      ctx.strokeStyle = prevStyle;
    }
  }
}

class BeholderShot extends Projectile {
  constructor(game, x, y, direction, damage) {
    let animation;
    switch (direction) {
      case 'up':
        animation = new Animation(AM.getAsset('./img/shot.png'),
          0, 0, 32, 32, 3, 0.333, 3, true);
        break;
      case 'right':
        animation = new Animation(AM.getAsset('./img/shot.png'),
          0, 32, 32, 32, 3, 0.333, 3, true);
        break;
      case 'down':
        animation = new Animation(AM.getAsset('./img/shot.png'),
          0, 64, 32, 32, 3, 0.333, 3, true);
        break;
      case 'left':
        animation = new Animation(AM.getAsset('./img/shot.png'),
          0, 96, 32, 32, 3, 0.333, 3, true);
        break;
    }
    super(game, animation, x, y, direction, damage);
  }

  update() {
    super.update();
    let box1 = this.bounding;
    let box2 = this.game.player.bounding;
    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
      if (this.game.player.godTimer <= 0 &&
        this.game.player.blockCooldown <= 0) {
        this.game.player.currentHP = Math.max(
          this.game.player.currentHP - this.damage, 0);
        this.game.player.godTimer = GOD_COOLOFF;
      } else {
        this.game.entities.remove(this);
      }
    }
  }
}

class PlayerShot extends Projectile {
  constructor(game, x, y, direction, damage) {
    let animation;
    switch (direction) {
      case 'up':
        animation = new Animation(AM.getAsset('./img/playerShot.png'),
          0, 0, 32, 32, 3, 0.333, 3, true);
        break;
      case 'right':
        animation = new Animation(AM.getAsset('./img/playerShot.png'),
          0, 32, 32, 32, 3, 0.333, 3, true);
        break;
      case 'down':
        animation = new Animation(AM.getAsset('./img/playerShot.png'),
          0, 64, 32, 32, 3, 0.333, 3, true);
        break;
      case 'left':
        animation = new Animation(AM.getAsset('./img/playerShot.png'),
          0, 96, 32, 32, 3, 0.333, 3, true);
        break;
    }
    super(game, animation, x, y, direction, damage);
    if (direction === 'up' || direction === 'down') {
      this.bounding.w = 64;
      this.bounding.x -= 16;
    } else {
      this.bounding.h = 64;
      this.bounding.y -= 16;
    }
  }

  update() {
    super.update();
    let that = this;
    let remove = false;
    this.game.entities.iterate(function (entity) {
      if (entity.isEnemy) {
        let box1 = that.bounding;
        let box2 = entity.bounding;
        if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
          && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y
          && !that.hit) {
          entity.currentHP -= that.damage;
          entity.hitSound.play();
          entity.hitCooldown = 1;
          remove = true;
        }
      }
    });
    if (remove) {
      this.game.entities.remove(this);
    }
  }
}

class Wraith extends Enemy {
  constructor(game, spritesheet, x, y, w, h, level) {
    let statemachine = new StateMachine();
    super(game, statemachine, x, y, w, h, level);
    this.attackDistance = 450;
    this.bounding = new Rectangle(x + 1, y + 1, 30, 44);
    this.boundingXOffset = 1;
    this.boundingYOffset = 1;
    this.points = 30;
    this.hitSound = AM.getAsset('./snd/wraith.wav');
    this.game.sounds.add(this.hitSound);
    this.collidesWithWalls = false;
    let hurtSprite = AM.getAsset('./img/wraithd.png');
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

    statemachine.addState('idleDownHurt', new Animation(hurtSprite, 0, 0, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('runDownHurt', new Animation(hurtSprite, 0, 0, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('idleLeftHurt', new Animation(hurtSprite, 0, 64, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('runLeftHurt', new Animation(hurtSprite, 0, 64, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('idleUpHurt', new Animation(hurtSprite, 0, 128, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('runUpHurt', new Animation(hurtSprite, 0, 128, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('idleRightHurt', new Animation(hurtSprite, 0, 192, 32, 64,
      2, 0.5, 2, true));
    statemachine.addState('runRightHurt', new Animation(hurtSprite, 0, 192, 32, 64,
      2, 0.5, 2, true));
  }
}

class Gargoyle extends Enemy {
  constructor(game, spritesheet, x, y, w, h, level, dir) {
    let statemachine = new StateMachine();
    super(game, statemachine, x, y, w, h, level);
    this.attackDistance = 100;
    this.bounding = new Rectangle(x + 4, y + 2, 25, 45);
    this.boundingXOffset = 4;
    this.boundingYOffest = 2;
    this.canMove = false;
    this.direction = dir;
    switch (dir) {
      case 'N':
    statemachine.addState('idleDown',
      new Animation(spritesheet, 0, 0, 32, 64, 1, 1, 1, true));
    statemachine.addState('attackDown',
      new Animation(spritesheet, 0, 256, 32, 64, 2, 0.5, 2, true));
        break;
      case 'E':
    statemachine.addState('idleLeft',
      new Animation(spritesheet, 0, 64, 32, 64, 1, 1, 1, true));
    statemachine.addState('attackLeft',
      new Animation(spritesheet, 0, 320, 32, 64, 3, 0.333, 3, true));
        break;
      case 'S':
    statemachine.addState('idleUp',
      new Animation(spritesheet, 0, 128, 32, 64, 1, 1, 1, true));
    statemachine.addState('attackUp',
      new Animation(spritesheet, 0, 384, 32, 64, 2, 0.5, 2, true));
        break;
      case 'W':
    statemachine.addState('idleRight',
      new Animation(spritesheet, 0, 192, 32, 64, 1, 1, 1, true));
    statemachine.addState('attackRight',
      new Animation(spritesheet, 0, 448, 32, 64, 3, 0.333, 3, true));
        break;
    }
  }

  update() {
    let box1 = new Rectangle(this.x, this.y, 64, 64);
    let box2 = this.game.player.bounding;
    switch (this.direction) {
      case 'N':
        box1.y += this.h;
        break;
      case 'E':
        box1.x -= this.w;
        break;
      case 'S':
        box1.y -= this.h;
        break;
      case 'W':
        box1.x += this.w;
        break;
    }

    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y) {
      this.attack();
    } else if (this.attackCooldown <= 0) {
      switch (this.direction) {
        case 'N':
          this.stateMachine.setState('idleDown');
          break;
        case 'E':
          this.stateMachine.setState('idleLeft');
          break;
        case 'S':
          this.stateMachine.setState('idleUp');
          break;
        case 'W':
          this.stateMachine.setState('idleRight');
          break;
      }
    } else {
      this.attackCooldown -= this.game.clockTick;
    }
  }

  attack() {
    let strike = null;
    switch (this.direction) {
      case 'N':
        this.stateMachine.setState('attackDown');
        strike = new EnemyStrike(this.game, this.x, this.y, 'down', this.damage);
        break;
      case 'E':
        this.stateMachine.setState('attackLeft');
        strike = new EnemyStrike(this.game, this.x - 6,
          this.y, 'left', this.damage);
        break;
      case 'S':
        this.stateMachine.setState('attackUp');
        strike = new EnemyStrike(this.game, this.x, this.y, 'up', this.damage);
        break;
      case 'W':
        this.stateMachine.setState('attackRight');
        strike = new EnemyStrike(this.game, this.x - 52 + this.bounding.w,
          this.y, 'right', this.damage);
        break;
    }
    this.game.entities.add(strike);
    this.attackCooldown = 1;
  }
}

class Dragon extends Enemy {
  constructor(game, spritesheet, x, y, w, h, level) {
    let statemachine = new StateMachine();
    // adjust x and y to center dragon in final level
    super(game, statemachine, x - 60, y - 22, w, h, level);
    this.canMove = false;
    this.bounding = new Rectangle(x - 11, y - 22, 233, 184);
    this.boundingXOffset = 11;
    this.boundingYOffset = 22;
    this.attackCooldown = 2;
    this.shootSound = AM.getAsset('./snd/shoot.wav');
    this.game.sounds.add(this.shootSound);
    this.points = 1000;
    let hurtSprite = AM.getAsset('./img/dragond.png');
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

    statemachine.addState('idleDragonHurt',
      new Animation(spritesheet, 0, 0, 256, 256, 2, 0.5, 2, true));
    statemachine.addState('jumpDragonHurt',
      new Animation(spritesheet, 0, 256, 256, 256, 6, 0.166, 6, true));
    statemachine.addState('stompLeftDragonHurt',
      new Animation(spritesheet, 0, 512, 256, 256, 4, 0.25, 4, true));
    statemachine.addState('stompRightDragonHurt',
      new Animation(spritesheet, 0, 768, 256, 256, 4, 0.25, 4, true));
    statemachine.addState('readyFireDragonHurt',
      new Animation(spritesheet, 0, 1024, 256, 256, 3, 0.333, 3, true));
    statemachine.addState('headWestDragonHurt',
      new Animation(spritesheet, 0, 1280, 256, 256, 3, 0.333, 3, true));
    statemachine.addState('headEastDragonHurt',
      new Animation(spritesheet, 0, 1536, 256, 256, 3, 0.333, 3, true));

    statemachine.setState('idleDragon');
  }

  update(){
    if (this.currentHP <= 0) {
      this.game.win();
    }

    let distance = Math.abs(this.game.player.y - this.y);
    if (this.attackCooldown <= 0) {
      if (distance < 220) {
        this.stateMachine.setState('jumpDragon');
        this.game.entities.add(new Stomp(this.game, this.x, this.y + this.bounding.h, 'jump'));
      } else if (distance < 300) {
        if (this.game.player.x > this.x + 128) {
          this.stateMachine.setState('stompRightDragon');
          this.game.entities.add(new Stomp(this.game, this.x + 150, this.y + this.bounding.h, 'right'));
        } else {
          this.stateMachine.setState('stompLeftDragon');
          this.game.entities.add(new Stomp(this.game, this.x - 150, this.y + this.bounding.h, 'left'));
        }
      }
      this.shootSound; //<---- should this have play ?
      this.attackCooldown = 2;
    } else {
      if (this.game.player.x < this.x + 64) {
        this.stateMachine.setState('headWestDragon');
      } else if (this.game.player.x > this.x + 192) {
        this.stateMachine.setState('headEastDragon');
      } else {
        this.stateMachine.setState('idleDragon');
      }
      this.attackCooldown -= this.game.clockTick;
    }
  }
}

class Stomp {
  constructor(game, x, y, type) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.bounding = new Rectangle(x, y, 256, 256);
    this.cooldown = 1;
    this.damage = 9;
    this.hitSound = AM.getAsset('./snd/hit.ogg');
    this.game.sounds.add(this.hitSound);
    switch (type) {
      case 'jump':
        this.animation = new Animation(AM.getAsset('./img/bossAttack.png'), 0,
          0, 256, 256, 4, 0.25, 4, true);
        break;
      case 'left':
        this.animation = new Animation(AM.getAsset('./img/bossAttack.png'), 0,
          256, 256, 256, 4, 0.25, 4, true);
        break;
      case 'right':
        this.animation = new Animation(AM.getAsset('./img/bossAttack.png'), 0,
          512, 256, 256, 4, 0.25, 4, true);
        break;
    }
  }

  update() {
    this.cooldown -= this.game.clockTick;
    if (this.cooldown <= 0) {
      this.game.entities.remove(this);
    }
    let box1 = this.bounding;
    let box2 = this.game.player.bounding;
    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y
      && !this.hit) {
      if (this.game.player.godTimer > 0) {
        this.game.entities.remove(this);
      } else {
        this.game.player.currentHP = Math.max(
          this.game.player.currentHP - this.damage, 0);
        this.game.player.godTimer = GOD_COOLOFF;
        this.hitSound.play();
        this.hit = true;
      }
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

class Fireball {
  constructor(game, x, y, type) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.bounding = new Rectangle(x, y, 256, 256);
    this.cooldown = 1;
    this.damage = 3;
    this.hitSound = AM.getAsset('./snd/hit.ogg');
    this.game.sounds.add(this.hitSound);
    switch (type) {
      case 'center':
        this.animation = new Animation(AM.getAsset('./img/bossAttack.png'), 0,
          768, 256, 256, 4, 0.25, 4, true);
        break;
      case 'left':
        this.animation = new Animation(AM.getAsset('./img/bossAttack.png'), 0,
          1024, 256, 256, 4, 0.25, 4, true);
        break;
      case 'right':
        this.animation = new Animation(AM.getAsset('./img/bossAttack.png'), 0,
          1280, 256, 256, 4, 0.25, 4, true);
        break;
    }
  }

  update() {
    this.cooldown -= this.game.clockTick;
    if (this.cooldown <= 0) {
      this.game.entities.remove(this);
    }
    let box1 = this.bounding;
    let box2 = this.game.player.bounding;
    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y
      && !this.hit) {
      if (this.game.player.godTimer > 0) {
        this.game.entities.remove(this);
      } else {
        this.game.player.currentHP = Math.max(
          this.game.player.currentHP - this.damage, 0);
        this.game.player.godTimer = GOD_COOLOFF;
        this.hitSound.play();
        this.hit = true;
      }
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

class BossAttack {
  constructor(game, x, y, type, damage) {
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


const SPEED = 200;

class DonJon {
  constructor(gameEngine, spritesheet, sounds, x, y, w, h) {
    this.game = gameEngine;
    this.spritesheet = spritesheet;
    this.name = 'DonJon';
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.godTimer = 0;
    this.bounding = new Rectangle(x + w/8, y + h/2 + 1, w - w/4, h/2 - 2);
    this.prevX = x;
    this.prevY = y;
    this.speed = 200; // in px/s
    this.maxHP= 24;
    this.currentHP = 24;
    this.maxMana = 4;
    this.currentMana = 4;
    this.attackDamage = 2;
    this.score = 0;
    this.attackCooldown = 0;
    this.blockCooldown = 0;
    this.spellCooldown = 0;
    this.direction = 'S';
    this.soundWalk = sounds.walk;
    this.soundWalk.loop = true;
    this.soundSwing = sounds.swing;
    this.soundSpell = sounds.spell;
    this.game.sounds.add(this.soundWalk);
    this.game.sounds.add(this.soundSwing);
    this.game.sounds.add(this.soundSpell);
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
    this.stateMachine.addState('blockDownDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 64, 512, 32, 64, 1, 1, 1, true));
    this.stateMachine.addState('blockUpDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 64, 640, 32, 64, 1, 1, 1, true));
    this.stateMachine.addState('blockRightDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 64, 704, 32, 64, 1, 1, 1, true));
    this.stateMachine.addState('blockLeftDJ', new Animation(
      AM.getAsset('./img/main_dude.png'), 64, 576, 32, 64, 1, 1, 1, true));
    this.stateMachine.addState('blockDownDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 64, 512, 32, 64, 1, 1, 1, true));
    this.stateMachine.addState('blockUpDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 64, 640, 32, 64, 1, 1, 1, true));
    this.stateMachine.addState('blockRightDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 64, 704, 32, 64, 1, 1, 1, true));
    this.stateMachine.addState('blockLeftDJG', new Animation(
      AM.getAsset('./img/main_dude_god.png'), 64, 576, 32, 64, 1, 1, 1, true));
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
    if (this.currentHP <= 0) {
      this.soundWalk.pause();
      this.game.lose();
    }
    if (this.game.gameOver) {
      this.soundWalk.pause();
    }
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
    if (cursor.rightPressed) {
      this.direction = 'E';
      this.prevX = this.x;
      this.x += this.game.clockTick * SPEED;
    } else if (cursor.leftPressed) {
      this.direction = 'W';
      this.prevX = this.x;
      this.x -= this.game.clockTick * SPEED;
    }
    if (cursor.upPressed) {
      this.direction = 'N';
      this.prevY = this.y;
      this.y -= this.game.clockTick * SPEED;
    } else if (cursor.downPressed) {
      this.direction = 'S';
      this.prevY = this.y;
      this.y += this.game.clockTick * SPEED;
    }
    if (cursor.upPressed || cursor.downPressed
      || cursor.leftPressed || cursor.rightPressed) {
      if (this.soundWalk.paused) {
        this.soundWalk.play();
      }
    } else {
      this.soundWalk.pause();
    }
    if (mouseValue) {
      if (this.attackCooldown <= 0) {
        let strike = null;
        switch(this.direction) {
          case 'N':
            strike = new PlayerStrike(this.game, this.x - 16, this.y - 10, 'up', this.attackDamage, -16, -10);
            break;
          case 'E':
            strike = new PlayerStrike(this.game, this.x - 20, this.y, 'right', this.attackDamage, -20, 0);
            break;
          case 'S':
            strike = new PlayerStrike(this.game, this.x - 16, this.y + 10, 'down', this.attackDamage, -16, 10);
            break;
          case 'W':
            strike = new PlayerStrike(this.game, this.x - 10, this.y, 'left', this.attackDamage, -10, 0);
            break;
        }
        this.game.entities.add(strike);
        this.soundSwing.play();
        if (!this.soundWalk.paused) {
          this.soundWalk.pause();
        }
        this.attackCooldown = 0.5;
      }
      mouseValue = false;
    }
    if (cursor.rightClick) {
      if (this.blockCooldown <= 0) {
        this.blockCooldown = 1;
      }
      cursor.rightClick = false;
    }
    if (cursor.spell) {
      if (this.spellCooldown <= 0 && this.currentMana > 0) {
        let spell = null;
        switch(this.direction) {
          case 'N':
            spell = new PlayerShot(this.game, this.x + this.w / 4, this.y, 'up',
              this.attackDamage);
            break;
          case 'E':
            spell = new PlayerShot(this.game, this.x + this.bounding.w,
              this.y + this.h / 4, 'right', this.attackDamage);
            break;
          case 'S':
            spell = new PlayerShot(this.game, this.x + this.w / 4,
              this.y + this.bounding.h, 'down', this.attackDamage);
            break;
          case 'W':
            spell = new PlayerShot(this.game, this.x - 32, this.y + this.h / 4,
              'left', this.attackDamage);
            break;
        }
        this.game.entities.add(spell);
        this.soundSpell.play();
        this.currentMana--;
        this.spellCooldown = 1;
      }
      cursor.spell = false;
    }
    if (this.attackCooldown > 0) {
      this.attackCooldown -= this.game.clockTick;
    }
    if (this.blockCooldown > 0) {
      this.blockCooldown -= this.game.clockTick;
    }
    if (this.spellCooldown > 0) {
      this.spellCooldown -= this.game.clockTick;
    }
    if (this.godTimer > 0) {
      this.godTimer -= this.game.clockTick;
    }
    this.bounding.x = this.x + 1;
    this.bounding.y = this.y + this.h / 2 + 1;
    this.setState();
  }

  setState() {
    if (this.godTimer > 0) {
      if (this.attackCooldown > 0) {
        switch (this.direction) {
            case 'N':
              this.stateMachine.setState('attackUpDJG');
              break;
            case 'E':
              this.stateMachine.setState('attackRightDJG');
              break;
            case 'S':
              this.stateMachine.setState('attackDownDJG');
              break;
            case 'W':
              this.stateMachine.setState('attackLeftDJG');
              break;
        }
      } else if (this.blockCooldown > 0) {
        switch (this.direction) {
          case 'N':
            this.stateMachine.setState('blockUpDJG');
            break;
          case 'E':
            this.stateMachine.setState('blockRightDJG');
            break;
          case 'S':
            this.stateMachine.setState('blockDownDJG');
            break;
          case 'W':
            this.stateMachine.setState('blockLeftDJG');
            break;
        }
      } else if (!cursor.upPressed && !cursor.downPressed &&
        !cursor.rightPressed && !cursor.leftPressed) {
        switch (this.direction) {
            case 'N':
              this.stateMachine.setState('idleUpDJG');
              break;
            case 'E':
              this.stateMachine.setState('idleRightDJG');
              break;
            case 'S':
              this.stateMachine.setState('idleDownDJG');
              break;
            case 'W':
              this.stateMachine.setState('idleLeftDJG');
              break;
        }
      } else {
        switch (this.direction) {
            case 'N':
              this.stateMachine.setState('runUpDJG');
              break;
            case 'E':
              this.stateMachine.setState('runRightDJG');
              break;
            case 'S':
              this.stateMachine.setState('runDownDJG');
              break;
            case 'W':
              this.stateMachine.setState('runLeftDJG');
              break;
        }
      }
    } else {
      if (this.attackCooldown > 0) {
        switch (this.direction) {
            case 'N':
              this.stateMachine.setState('attackUpDJ');
              break;
            case 'E':
              this.stateMachine.setState('attackRightDJ');
              break;
            case 'S':
              this.stateMachine.setState('attackDownDJ');
              break;
            case 'W':
              this.stateMachine.setState('attackLeftDJ');
              break;
        }
      } else if (this.blockCooldown > 0) {
        switch (this.direction) {
          case 'N':
            this.stateMachine.setState('blockUpDJ');
            break;
          case 'E':
            this.stateMachine.setState('blockRightDJ');
            break;
          case 'S':
            this.stateMachine.setState('blockDownDJ');
            break;
          case 'W':
            this.stateMachine.setState('blockLeftDJ');
            break;
        }
      } else if (!cursor.upPressed && !cursor.downPressed &&
        !cursor.rightPressed && !cursor.leftPressed) {
          switch (this.direction) {
            case 'N':
              this.stateMachine.setState('idleUpDJ');
              break;
            case 'E':
              this.stateMachine.setState('idleRightDJ');
              break;
            case 'S':
              this.stateMachine.setState('idleDownDJ');
              break;
            case 'W':
              this.stateMachine.setState('idleLeftDJ');
              break;
          }
      } else {
        switch (this.direction) {
            case 'N':
              this.stateMachine.setState('runUpDJ');
              break;
            case 'E':
              this.stateMachine.setState('runRightDJ');
              break;
            case 'S':
              this.stateMachine.setState('runDownDJ');
              break;
            case 'W':
              this.stateMachine.setState('runLeftDJ');
              break;
        }
      }
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
  constructor(gameEngine, x, y, direction, durationOfAnimation) {
    this.game = gameEngine;
    this.x = x;
    this.y = y;
    this.bounding = new Rectangle(x, y, 64, 64);
    this.cooldown = durationOfAnimation;
    switch (direction) {
      case 'up': this.animation = new Animation(
        AM.getAsset('./img/Strike.png'), 0, 0, 64, 64, 5,
          durationOfAnimation / 5, 5, true);
        this.bounding.y -= 40;
        break;
      case 'right': this.animation = new Animation(
        AM.getAsset('./img/Strike.png'), 0, 64, 64, 64, 5,
          durationOfAnimation / 5, 5, true);
        this.bounding.x += 49;
        break;
      case 'down': this.animation = new Animation(
        AM.getAsset('./img/Strike.png'), 0, 128, 64, 64, 5,
          durationOfAnimation / 5, 5, true);
        this.bounding.y += 49;
        break;
      case 'left': this.animation = new Animation(
        AM.getAsset('./img/Strike.png'), 0, 192, 64, 64, 5,
          durationOfAnimation / 5, 5, true);
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
    super(gameEngine, x, y, direction, 1);
    this.hit = false;
    this.damage = damage;
    this.enemyStike = AM.getAsset('./snd/hit.ogg');
    this.game.sounds.add(this.enemyStike);
  }

  update() {
    super.update();
    let box1 = this.bounding;
    let box2 = this.game.player.bounding;
    if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
      && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y
      && !this.hit) {
      if (this.game.player.godTimer > 0 || this.game.player.blockCooldown > 0) {
        this.game.entities.remove(this);
      } else {
        this.game.player.currentHP = Math.max(
          this.game.player.currentHP - this.damage, 0);
        this.game.player.godTimer = GOD_COOLOFF;

          if (!this.game.isMuted) {

            this.enemyStike.play();
          }
          this.hit = true;
        }
      }
    }
}

class PlayerStrike extends Strike {
  constructor(gameEngine, x, y, direction, damage, xOffset, yOffset) {
    super(gameEngine, x, y, direction, 0.2);
    this.hit = false;
    this.damage = damage;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
  }

  update() {
    super.update();
    let dx = this.game.player.x - this.x + this.xOffset;
    let dy = this.game.player.y - this.y + this.yOffset;
    this.x += dx;
    this.bounding.x += dx;
    this.y += dy;
    this.bounding.y += dy;
    let that = this;
    this.game.entities.iterate(function (entity) {
      if (entity.isEnemy) {
        let box1 = that.bounding;
        let box2 = entity.bounding;
        if (box1.x < box2.x + box2.w && box1.x + box1.w > box2.x
          && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y
          && !that.hit) {
          entity.currentHP -= that.damage;
          entity.hitSound.play();
          entity.hitCooldown = 1;
          that.hit = true;
        }
      }
    });
  }
}

AM.queueDownload('./img/potion.png');
AM.queueDownload('./img/life.png');
AM.queueDownload('./img/strength.png');
AM.queueDownload('./img/map2.png');
AM.queueDownload('./img/goblin.png');
AM.queueDownload('./img/goblind.png');
AM.queueDownload('./img/beholder.png');
AM.queueDownload('./img/beholderd.png');
AM.queueDownload('./img/main_dude.png');
AM.queueDownload('./img/main_dude_god.png');
AM.queueDownload('./img/shot.png');
AM.queueDownload('./img/Strike.png');
AM.queueDownload('./img/wraith.png');
AM.queueDownload('./img/wraithd.png');
AM.queueDownload('./img/gargoyle.png');
AM.queueDownload('./img/dragon.png');
AM.queueDownload('./img/dragond.png');
AM.queueDownload('./img/bossAttack.png');
AM.queueDownload('./img/mana.png');
AM.queueDownload('./img/playerShot.png');

AM.queueDownload('./snd/background.mp3');
AM.queueDownload('./snd/ladder.wav');
AM.queueDownload('./snd/hole.wav');
AM.queueDownload('./snd/footsteps.wav');
AM.queueDownload('./snd/swing.wav');
AM.queueDownload('./snd/life.wav');
AM.queueDownload('./snd/health.wav');
AM.queueDownload('./snd/strength.wav');
AM.queueDownload('./snd/goblin.wav');
AM.queueDownload('./snd/wraith.wav');
AM.queueDownload('./snd/beholder_shoot.wav');
AM.queueDownload('./snd/hit.ogg');
AM.queueDownload('./snd/win.wav');
AM.queueDownload('./snd/shoot.wav');
AM.queueDownload('./snd/death.wav');

AM.downloadAll(function () {

  const canvas = document.getElementById('gameWorld');
  let started = false;
  canvas.onclick = function () {
    if (!started) {
      gameEngine.start();
      started = true;
    }
  };
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false; // Turn off anti-aliasing

  const gameEngine = new GameEngine();
  const background = AM.getAsset('./snd/background.mp3');
  const win = AM.getAsset('./snd/win.wav');
  const loss = AM.getAsset('./snd/death.wav');
  gameEngine.init(ctx, background, win, loss);

  const powerups = [
    {
      name: 'pHealth',
      constructor: function (x, y) {
        let potionSound = AM.getAsset('./snd/health.wav');
        gameEngine.sounds.add(potionSound);
        return new HealthPotion(gameEngine, AM.getAsset('./img/potion.png'),
          potionSound, x, y);
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
        let strengthSound = AM.getAsset('./snd/strength.wav');
        gameEngine.sounds.add(strengthSound);
        return new StrengthBuff(gameEngine, AM.getAsset('./img/strength.png'),
          strengthSound, x, y);
      },
      number: 1
    },
    {
      name: 'pMana',
      constructor: function (x, y) {
        return new ManaPotion(gameEngine, AM.getAsset('./img/mana.png'),
          AM.getAsset('./snd/health.wav'), x, y);
      },
      number: 1
    }
  ];

  const enemies = [
    {
      name: 'eGoblin',
      constructor: function (x, y, level) {
        return new Goblin(gameEngine, AM.getAsset('./img/goblin.png'), x, y,
          SIZE / 2, SIZE, level);
      },
      width: 1,
      height: 2,
      number: [3, 5, 5, 5, 5, 3, 2, 3, 2, 3, 2, 0]
    },
    {
      name: 'eBeholder',
      constructor: function (x, y, level) {
        return new Beholder(gameEngine, AM.getAsset('./img/beholder.png'), x, y,
          SIZE, SIZE, level);
      },
      width: 2,
      height: 2,
      number: [2, 2, 2, 2, 3, 4, 3, 2, 2, 3, 3, 2, 0]
    },
    {
      name: 'eWraith',
      constructor: (x, y, level) => {
        return new Wraith(gameEngine, AM.getAsset('./img/wraith.png'), x, y,
          SIZE / 2, SIZE, level);
      },
      width: 1,
      height: 2,
      number: [0, 0, 2, 2, 3, 4, 3, 3, 3, 3, 4, 5, 0]
    },
    {
      name: 'eGargoyle',
      constructor: (x, y, level, dir) => {
        return new Gargoyle(gameEngine, AM.getAsset('./img/gargoyle.png'), x, y,
          SIZE / 2, SIZE, level, dir);
      },
      width: 1,
      height: 2,
      number: [0, 1, 1, 2, 3, 1, 1, 2, 2, 3, 3, 2, 0] // must be <= # of powerups
    }
    ,
    {
      name: 'eDragon',
      constructor: (x, y, level) => {
        return new Dragon(gameEngine, AM.getAsset('./img/dragon.png'), x, y,
          SIZE * 2, SIZE * 2, level);
      },
      width: 4,
      height: 4,
      number: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  ];

  let world = new World(13, powerups, enemies, AM);
  gameEngine.setWorld(world);
  gameEngine.setLevel(0);

  ctx.save();
  ctx.font = '2rem "Press Start", monospace';
  ctx.fillStyle = 'white';
  ctx.fillText('Click to Start', 90, gameEngine.surfaceHeight / 2);
  ctx.restore();

  console.log('Finished downloading assets');
});
