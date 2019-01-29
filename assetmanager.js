class AssetManager {
  constructor() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
  }

  queueDownload(path) {
    console.log('Queueing ' + path);
    this.downloadQueue.push(path);
  }

  isDone() {
    return this.downloadQueue.length === this.successCount + this.errorCount;
  }

  downloadAll(callback) {
    for (let i = 0; i < this.downloadQueue.length; i++) {
      let img = new Image();
      let self = this;

      let path = this.downloadQueue[i];
      console.log(path);

      img.addEventListener('load', function () {
        console.log('Loaded ' + this.src);
        self.successCount++;
        if (self.isDone()) {
          callback();
        }
      });

      img.addEventListener('error', function () {
        console.error('Error loading ' + this.src);
        self.errorCount++;
        if (self.isDone()) {
          callback();
        }
      });

      img.src = path;
      this.cache[path] = img;
    }
  }

  getAsset(path) {
    if (!(path in this.cache)) {
      console.error('Asset', path, 'does not exist');
    }
    return this.cache[path];
  }
}
