class StateMachine {
  constructor() {
    this.stateMap = new Map();
  }

  getState() {
    return this.state;
  }

  getStateName() {
    return this.stateName;
  }

  addState(stateName, stateAnimation) {
    this.stateMap.set(stateName, stateAnimation);
  }

  setState(stateName) {
    this.state = this.stateMap.get(stateName);
    this.stateName = stateName;
  }

  draw(clockTick, ctx, x, y) {
    if(this.state) {
      this.state.drawFrame(clockTick, ctx, x, y);
    }
  }
}
