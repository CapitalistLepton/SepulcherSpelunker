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
    var scaleBy = scaleBy || 1;
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
          this.frameWidth * scaleBy,
          this.frameHeight * scaleBy);
  }

  currentFrame() {
    return Math.floor(this.elapsedTime / this.frameDuration);
  }

  isDone() {
    return (this.elapsedTime >= this.totalTime);
  }
}

// class MushroomDude {
//   constructor(game, spritesheet) {
//     this.animation = new Animation(spritesheet,0, 0,  189, 230, 5, 0.10, 14, true, 1);
//     this.x = 0;
//     this.y = 0;
//     this.speed = 100;
//     this.game = game;
//
//   }
//
//   draw(ctx) {
//     this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
//
//   }
//
//   update() {
//     if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14) {
//       this.x += this.game.clockTick * this.speed;
//     }
//     if (this.x > 800) {
//       this.x = -230;
//     }
//   }
// }

class DonJon {
  constructor(game, spritesheet) {
      // this.state = new StateMachine( DON_JON, POSITION_2_MULT, POSITION_X, IDLE_RIGHT);
      this.stateIdleDown = new Statemachine(DON_JON).getStateDonJon(IDLE_DOWN);
      this.animationDownIdle = new Animation(spritesheet, 0, this.stateIdleDown.spriteY, 32, 63, 2, 0.08, 2, true, 1);
      // this.animationDown = new Animation(spritesheet, 0, 0, 34, 66, 2, 0.08, 2, true, 1);
      this.stateIdleLeft = new Statemachine(DON_JON).getStateDonJon(IDLE_LEFT);
      this.animationLeftIdle = new Animation(AM.getAsset("./img/main_dude.png"), 0, this.stateIdleLeft.spriteY, 32, 63, 2, 0.08, 2, true, 1);

      this.stateIdleUp = new Statemachine(DON_JON).getStateDonJon(IDLE_UP);
      this.animationUpIdle = new Animation(AM.getAsset("./img/main_dude.png"), 0, this.stateIdleUp.spriteY, 32, 63, 2, 0.08, 2, true, 1);

      this.stateIdleRight = new Statemachine(DON_JON).getStateDonJon(IDLE_RIGHT);
      this.animationRightIdle = new Animation(AM.getAsset("./img/main_dude.png"), 0, this.stateIdleRight.spriteY, 32, 63, 2, 0.08, 2, true, 1);

      this.stateRunDown = new Statemachine(DON_JON).getStateDonJon(RUNNING_DOWN);
      this.animationRunDown = new Animation(AM.getAsset("./img/main_dude.png"), 0, this.stateRunDown.spriteY, 32, 63, 2, 0.08, 2, true, 1);

      this.stateRunLeft = new Statemachine(DON_JON).getStateDonJon(RUNNING_LEFT);
      this.animationRunLeft = new Animation(AM.getAsset("./img/main_dude.png"), 0, this.stateRunLeft.spriteY, 32, 65, 6, 0.10, 6, true, 1);

      this.stateRunUp = new Statemachine(DON_JON).getStateDonJon(RUNNING_UP);
      this.animationRunUp = new Animation(AM.getAsset("./img/main_dude.png"), 0, this.stateRunUp.spriteY, 32, 63,
          this.stateRunUp.sheetWidth, 0.10, this.stateRunUp.frames, true, 1);

      this.stateRunRight = new Statemachine(DON_JON).getStateDonJon(RUNNING_RIGHT);
      this.animationRunRight = new Animation(AM.getAsset("./img/main_dude.png"), 0,
          this.stateRunRight.spriteY, 32, 65, this.stateRunRight.sheetWidth, 0.10, this.stateRunRight.frames, true, 1);

      this.stateAttackDown = new Statemachine(DON_JON).getStateDonJon(ATTACK_DOWN);
      this.animationAttackDown = new Animation(AM.getAsset('./img/main_dude.png'), 0, this.stateAttackDown.spriteY,
          32, 65, this.stateAttackDown.sheetWidth, 0.10, this.stateAttackDown.frames, true, 1);

      this.stateAttackLeft = new Statemachine(DON_JON).getStateDonJon(ATTACK_LEFT);
      this.animationAttackLeft = new Animation(AM.getAsset('./img/main_dude.png'), 0, this.stateAttackLeft.spriteY,
          32, 64, this.stateAttackLeft.sheetWidth, 0.10, this.stateAttackLeft.frames, true, 1);

      this.stateAttackUp = new Statemachine(DON_JON).getStateDonJon(ATTACK_UP);
      this.animationAttackUp = new Animation(AM.getAsset('./img/main_dude.png'), 0, this.stateAttackUp.spriteY,
          32, 65, this.stateAttackUp.sheetWidth, 0.10, this.stateAttackUp.frames, true, 1);

      this.stateAttackRight= new Statemachine(DON_JON).getStateDonJon(ATTACK_RIGHT);
      this.animationAttackRight = new Animation(AM.getAsset('./img/main_dude.png'), 0, this.stateAttackRight.spriteY,
          32, 65, this.stateAttackRight.sheetWidth, 0.10, this.stateAttackRight.frames, true, 1);




      this.x = 470;
      this.y = 300;
      this.speed = 100;
      this.game = game;
      this.moveDown = false;
      this.moveLeft = false;
      this.moveUp = false;
      this.moveRight = false;
      this.attack = false;
      this.idleLeft = false;
      this.idleDown = false;
      this.idleRight = false;
      this.idleUp = false;
      this.isRight = true;

  }

    draw(ctx) {
        this.idleDown = this.game.idleDown;
        this.idleLeft = this.game.idleLeft;
        this.idleRight = this.game.idleRight;
        this.idleUp = this.game.idleUp;


        /**
         * Just used for state verification.
         */
        // if(!this.isRight){
        //     // this.animationAttackUp.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
        //     this.animationAttackLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
        //
        // } else {
        //     // console.log(this.testStateMachine);
        //     // this.animationAttackDown.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
        //     this.animationAttackRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
        // }

        /**
         * Move left and right user controlled.
         */
        if (!this.moveRight && !this.moveLeft && !this.attack) {
            this.animationLeftIdle.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            // console.log("IDLE move MAIN");
        } else if (this.moveRight && !this.attack) {
            this.animationRunRight.drawFrame(this.game.clockTick,ctx,this.x, this.y);
            console.log("RIGHT move MAIN");
        } else if (this.moveLeft && !this.attack) {
            console.log("LEFT move MAIN");
            this.animationRunLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }else if (this.attack && this.moveRight && !this.moveLeft) {
            console.log("RIGHT  attack move MAIN");
            this.animationAttackRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        } else if( this.attack && !this.moveRight && this.moveLeft) {
            console.log("LEFT ATTACK move MAIN");
            this.animationAttackLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }



        }



    update() {
      this.moveDown = this.game.moveDown;
      this.moveLeft = this.game.moveLeft;
      this.moveRight = this.game.moveRight;
      this.moveUp  = this.game.moveUp;
      this.attack = this.game.attack;



      // if(this.moveLeft && this.moveDown) {
      //   this.x -= this.game.clockTick * this.speed;
      //   this.y -= this.game.clockTick * this.speed;
      //     console.log("Update left and down");
      // } else if( this.moveLeft && this.moveUp) {
      //   this.x -= this.game.clockTick * this.speed;
      //   this.y += this.game.clockTick * this.speed;
      //     console.log("Update left and up");
      // } else if (this.moveRight && this.moveUp) {
      //     this.x += this.game.clockTick * this.speed;
      //     this.y += this.game.clockTick * this.speed;
      //     console.log("Update right and up");
      // } else if( this.moveRight && this.moveDown){
      //     this.x += this.game.clockTick * this.speed;
      //     this.y -= this.game.clockTick * this.speed;
      //     console.log("Update right and Down");
      // } else if(this.moveRight){
      //   this.x += this.game.clockTick * this.speed;
      //     console.log("Update right");
      // } else if( this.moveLeft) {
      //   this.x -= this.game.clockTick * this.speed;
      //     console.log("Update left");
      // }

      // this.x += this.game.clockTick * this.speed;



      // if (this.x > 800) {
      //     this.x = -100;
      // }


        /**
         * up and down.
         */
        // if (this.y < 300 && !this.isRight) {
        //
        //     this.isRight = true;
        // } else if (this.y < 400 && this.isRight) {
        //     this.y += this.game.clockTick * this.speed;
        //
        // } else {
        //     this.isRight = false;
        //
        //     this.y -= this.game.clockTick * this.speed;
        // }

        /**
         * Left and right.
         */

        // if (this.x < 50 && !this.isRight) {
        //
        //     this.isRight = true;
        // } else if (this.x < 370 && this.isRight) {
        //     this.x += this.game.clockTick * this.speed;
        //
        // } else {
        //     this.isRight = false;
        //
        //     this.x -= this.game.clockTick * this.speed;
        // }

        /**
         * Move Left and right user controlled.
         */
        if (this.moveRight) {
            this.x += this.game.clockTick * this.speed;
        } else if (this.moveLeft) {
            this.x -= this.game.clockTick * this.speed;
        }




    }

}
class Background{
    constructor(game, spritesheet) {
        this.x = 0;
        this.y = 0;
        this.spritesheet = spritesheet;
        this.ctx = game.ctx;
    }

    draw() {
        this.ctx.drawImage(this.spritesheet, this.x, this.y);
    }

    update(){}
}

// AM.queueDownload('./img/mushroomdude.png');
AM.queueDownload('./img/background.png');
AM.queueDownload('./img/main_dude.png');


AM.downloadAll(function () {
  const canvas = document.getElementById('gameWorld');
  const ctx = canvas.getContext('2d');

  const gameEngine = new GameEngine();
  gameEngine.init(ctx);
  gameEngine.start();

  gameEngine.addEntity(new Background(gameEngine, AM.getAsset('./img/background.png')));
  gameEngine.addEntity(new DonJon(gameEngine, AM.getAsset('./img/main_dude.png')));

  // gameEngine.addEntity(new MushroomDude(gameEngine,
    // AM.getAsset('./img/mushroomdude.png')));
  console.log('Finished downloading assets');
});
