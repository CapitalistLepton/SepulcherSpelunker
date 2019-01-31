class StateMachine {

    constructor(idleStateName, idleStateAnimation) {
        this.stateMap = new Map();
        this.stateMap.set(idleStateName, idleStateAnimation);
        this.state = this.stateMap.get(idleStateName);


        console.log(this.state);
    }

    getState() {
        return this.state;
    }

    addState(stateName, stateAnimation) {
        // this.state[stateName] = stateAnimation;
        this.stateMap.set(stateName, stateAnimation);

    }

    setState(stateAnimation) {
        this.state = this.stateMap.get(stateAnimation);
    }

    draw(clockTick, ctx, x, y) {
        this.state.drawFrame(clockTick, ctx, x, y);

    }

}
