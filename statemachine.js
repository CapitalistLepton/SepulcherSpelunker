class StateMachine {
  constructor(idleStateName, idleStateAnimation) {
    this.stateMap = new Map();
    this.stateMap.set(idleStateName, idleStateAnimation);
    this.state = this.stateMap.get(idleStateName);
  }

  getState() {
    return this.state;
  }

  addState(stateName, stateAnimation) {
    this.stateMap.set(stateName, stateAnimation);
  }

  setState(stateName) {
    this.state = this.stateMap.get(stateName);
  }

  draw(clockTick, ctx, x, y) {
    this.state.drawFrame(clockTick, ctx, x, y);
  }
}
