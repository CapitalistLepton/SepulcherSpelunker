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
      // For each asset given check to see if its from the sound path or the image path
      let path = this.downloadQueue[i];
      // extract either "img", "snd", or ""

      let assetType = path.split('/')[1];
      console.log(path);



      if (assetType === 'img') {
        let img = new Image();
        let self = this;
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
      } else if (assetType === 'snd') {
        let self = this;
        let snd = new Audio(path);
        // snd.src = path;
        // This is called when the audio can be completely played thru without buffering
        snd.addEventListener('canplaythrough', function () {
          console.log('Loaded ' + this.src);
          self.successCount++;
          if (self.isDone()) {
            callback();
          }
        });

        snd.addEventListener('error', function () {
          console.error('Error loading ' + this.src);
          self.errorCount++;
          if (self.isDone()) {
            callback();
          }
        });

        this.cache[path] = snd;
      }
    }
  }

  getAsset(path) {
    if (!(path in this.cache)) {
      console.error('Asset', path, 'does not exist');
    }
    return this.cache[path];
  }
}
