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

class MushroomDude {
  constructor(game, spritesheet) {
    this.animation = new Animation(spritesheet, 189, 230, 5, 0.10, 14, true, 1);
    this.x = 0;
    this.y = 0;
    this.speed = 100;
    this.game = game;
  }

  draw(ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
  }

  update() {
    if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14) {
      this.x += this.game.clockTick * this.speed;
    }
    if (this.x > 800) {
      this.x = -230;
    }
  }
}

AM.queueDownload('./img/mushroomdude.png');

AM.downloadAll(function () {
  const canvas = document.getElementById('gameWorld');
  const ctx = canvas.getContext('2d');

  const gameEngine = new GameEngine();
  gameEngine.init(ctx);
  gameEngine.start();

  gameEngine.addEntity(new MushroomDude(gameEngine, 
    AM.getAsset('./img/mushroomdude.png')));
  console.log('Finished downloading assets');
});
