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
    this.walls = [];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.collisionDebug = false;
    this.player = undefined;
  }

  init(ctx, camera) {
    this.camera = camera;
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.camera.w = this.surfaceWidth;
    this.camera.h = this.surfaceHeight;
    this.timer = new Timer();
    this.startInput();
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

  startInput() {
    this.ctx.canvas.addEventListener('keydown', keyDownHandler);
    this.ctx.canvas.addEventListener('keyup', keyUpHandler);
    this.ctx.canvas.addEventListener('click', clickHandler);

    this.ctx.canvas.addEventListener('click', function (e) {
      // Attack on left click
    }, false);
  }

  loop() {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  addPlayer(entity) {
    this.player = entity;
    this.addEntity(this.player);
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
