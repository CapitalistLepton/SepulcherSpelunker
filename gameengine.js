window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function (callback, element) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

class Timer {
  constructor() {
    this.gameTime = 0;
    this.maxStep = 0.5;
    this.wallLastTimestamp = 0;
  }

  tick() {
    let wallCurrent = Date.now();
    let wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    let gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
  }
}

class GameEngine {
  constructor() {
    this.entities = [];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
  }
   this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;

      init(ctx) {
          this.ctx = ctx;
          this.timer = new Timer();
    const that = this;


          this.ctx.canvas.addEventListener('keydown', e => {
              switch (e.key) {
                  case 'W':
                  case 'w':  that.moveUp = true; that.idleUp = false; console.log('up'); break;
                  case 'S':
                  case 's': that.moveDown = true; that.idleDown = false; console.log('down'); break;
                  case 'A':
                  case 'a':  this.moveLeft = true; that.idleLeft = false; console.log('leftAnimation'); break;
                  case 'D':
                  case 'd': this.moveRight = true; that.idleRight = false; console.log('right'); break;
                  default: console.log('Unknown ' + e.key);
              }
          }, false);
          this.ctx.canvas.addEventListener("keyup", e => {
              switch (e.key) {
                  case 'W':
                  case 'w': that.moveUp = false; that.idleUp = true; console.log('up'); break;
                  case 'S':
                  case 's': that.moveDown = true; that.idleDown = true; console.log('down'); break;
                  case 'A':
                  case 'a': this.moveLeft = true; that.idleLeft = true; console.log('leftAnimation'); break;
                  case 'D':
                  case 'd': this.moveRight = true; that.idleRight = true; console.log('right'); break;
                  default: console.log('Unknown ' + e.key);
              }
          }, false);

        this.ctx.canvas.addEventListener('click',  e => {
          // Attack on leftAnimation click
            switch(e.key) {
              case 'clicked mouse':
                that.attack = true;
                console.log("attack in gameEngine");
                break;
                // default:
                //   that.attack = false;
                //     console.log(" no attack in gameEngine");
                //   break;
            }
            console.log("clicked mouse");
        }, false);





    // this.startInput();
    console.log('Game Initialized');
  }

  start() {
    console.log('Starting the game');
    var that = this;
    (function gameLoop() {
      that.loop();
      requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
  }

  // startInput(ctx) {
  //   this.ctx.canvas.addEventListener('keydown', e => {
  //     switch (e.key) {
  //       case 'W': console.log('up'); break;
  //       case 'w':  console.log('up'); break;
  //       case 'S':
  //       case 's': console.log('down'); break;
  //       case 'A':
  //       case 'a':  console.log('leftAnimation'); break;
  //       case 'D':
  //       case 'd':  console.log('right'); break;
  //       default: console.log('Unknown ' + e.key);
  //     }
  //   }, false);
  //
  //   this.ctx.canvas.addEventListener('click',  e => {
  //     // Attack on leftAnimation click
  //       console.log("clicked mouse");
  //   }, false);
  // }

  loop() {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  update() {
    let entitiesCount = this.entities.length;

    for (let i = 0; i < entitiesCount; i++) {
      let entity = this.entities[i];
      entity.update();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
  }
}
