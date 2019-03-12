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
    this.entities = null;
    this.walls = null;
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.collisionDebug = true;
    this.player = null;
    this.camera = null;
    this.gameOver = false;
    this.sounds = new LinkedList();
    this.muted = false;
  }

  init(ctx, backgroundMusic, winMusic, lossMusic) {
    this.ctx = ctx;
    this.backgroundMusic = backgroundMusic;
    this.winMusic = winMusic;
    this.lossMusic = lossMusic;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.timer = new Timer();

    this.sounds.add(this.backgroundMusic);
    this.sounds.add(this.winMusic);
    this.sounds.add(this.lossMusic);
    console.log('Game Initialized');
  }

  start() {
    console.log('Starting the game');
    this.startInput();
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.1;
    this.backgroundMusic.play();
    var that = this;
    (function gameLoop() {
      if (!that.gameOver) {
        that.loop();
      }
      requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
  }

  startInput() {
    this.ctx.canvas.addEventListener('keydown', keyDownHandler);
    this.ctx.canvas.addEventListener('keyup', keyUpHandler);
    this.ctx.canvas.addEventListener('click', clickHandler);
    this.ctx.canvas.addEventListener('contextmenu', rightClickHandler);

    let that = this;
    this.ctx.canvas.addEventListener('keydown', function(e) {
      e.preventDefaults;
      if (e.code === 'KeyM') {
        that.muteAudio();
      }
    });
  }

  loop() {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
  }

  setEntities(entityList) {
    this.entities = entityList;
  }
  addEntity(entity){
    this.entities.add(entity);
  }

  setPlayer(entity) {
    this.player = entity;
  }

  setCamera(camera) {
    this.camera = camera;
    this.camera.w = this.surfaceWidth;
    this.camera.h = this.surfaceHeight;
  }

  setWorld(world) {
    this.world = world;
  }

  setLevel(level) {
    this.entities = null;
    this.walls = null;
    // TODO add in a transition animation here
    this.world.setLevel(this, level);
  }

  muteAudio() {
    this.isMuted = !this.isMuted;
    let that = this;
    this.sounds.iterate(function(sound) {
      sound.muted = that.isMuted;
    });
  }

  win() {
    this.gameOver = true;
    let that = this;
    setTimeout(function() {
      that.backgroundMusic.pause();
      that.winMusic.play();
      that.ctx.save();
      that.ctx.font = '2rem "Press Start", monospace';
      that.ctx.fillStyle = 'white';
      that.ctx.fillText('You Won!', 220, that.surfaceHeight / 2);
      that.ctx.restore();
    }, 300);
  }

  lose() {
    this.gameOver = true;
    let that = this;
    setTimeout(function() {
      that.backgroundMusic.pause();
      that.lossMusic.play();
      that.ctx.save();
      that.ctx.font = '2rem "Press Start", monospace';
      that.ctx.fillStyle = 'white';
      that.ctx.fillText('Game Over', 220, that.surfaceHeight / 2);
      that.ctx.restore();
    }, 300);
  }

  update() {
    this.entities.iterate(function(entity) {
      entity.update();
    });
    if (this.player) {
      this.player.update();
      document.getElementById('health').innerHTML = 'HP ' +
        this.player.currentHP + '/' + this.player.maxHP;
      document.getElementById('mana').innerHTML = 'Mana ' +
        this.player.currentMana + '/' + this.player.maxMana;
      document.getElementById('level').innerHTML = 'Level ' + (this.world.level + 1);
      document.getElementById('damage').innerHTML = 'ATK ' +
        this.player.attackDamage;
      document.getElementById('score').innerHTML = 'Score ' + this.player.score;
    }
    if (this.camera) {
      this.camera.update();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    let ctx = this.ctx;
    this.entities.iterate(function (entity) {
      entity.draw(ctx);
    });
    if (this.player) {
      this.player.draw(ctx);
    }
    if (this.camera) {
      this.camera.draw(ctx);
    }
    this.ctx.restore();
  }
}
