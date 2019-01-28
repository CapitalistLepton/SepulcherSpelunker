

///String constants characters
const DON_JON = 'donJon';
const GOBLIN = 'goblin';
const BEHOLDER = 'beholder';
const DEMON = 'demon';
const WRAITH = 'wraith';
const IMP = 'imp';
const GARGOYLE = 'gargoyle';
const DRAGON = 'dragon';

//String constants directions
const IDLE_LEFT = 'idle_left';
const IDLE_RIGHT = 'idle_right';
const IDLE_UP = 'idle_up';
const IDLE_DOWN = 'idle_down';

const RUNNING_LEFT = 'running_left';
const RUNNING_RIGHT = 'running_right';
const RUNNING_UP = 'running_up';
const RUNNING_DOWN = 'running_down';

const ATTACK_LEFT = 'attack_left';
const ATTACK_RIGHT = 'attack_right';
const ATTACK_UP = 'attack_up';
const ATTACK_DOWN = 'attack_down';

const DEATH = 'death';

// Y location on sprite sheet
const Y_LOCATION_DON_JON = 64;
const Y_LOCATION_GOBLIN = 35;
const Y_LOCATION_DEMON = 35;
const Y_LOCATION_BEHOLDER = 35;
const Y_LOCATION_WRAITH = 35;
const Y_LOCATION_IMP = 35;
const Y_LOCATION_GARGOYLE = 35;
const Y_LOCATION_DRAGON = 35;

//state position Muplipliers
const POSITION_2_MULT = 2;
const POSITION_3_MULT = 3;
const POSITION_4_MULT = 4;
const POSITION_5_MULT = 5;
const POSITION_6_MULT = 6;
const POSITION_7_MULT = 7;
const POSITION_8_MULT = 8;
const POSITION_9_MULT = 9;
const POSITION_10_MULT = 10;
const POSITION_11_MULT = 11;
const POSITION_12_MULT = 12;

const POSITION_X = 0;


/**
 * state machine class to update or get current state
 * of characters in game.
 */
class Statemachine  {
    /**
     *
     * @param state
     * @param spritesheet
     */
    constructor(name) {
        this.name = name;
    }

    /**
     *Probably delete this and just
     */
    getState(name, desiredState) {
        switch(name) {
            case DON_JON:
                this.state = this.getStateDonJon(desiredState);
                break;

            case GOBLIN:
                this.state = this.getStateGoblin(desiredState);
                break;

            case BEHOLDER:
                this.state = this.getStateBeholder(desiredState);
                break;

            case DEMON:
                this.state = this.getStateDemon(desiredState);
                break;

            case WRAITH:
                this.state = this.getStateWraith(desiredState);
                break;

            case IMP:
                this.state = this.getStateImp(desiredState);
                break;

            case GARGOYLE:
                this.state = this.getStateGargoyle(desiredState);
                break;

            case DRAGON:
                this.state = this.getStateDragon(desiredState);
                break;
        }
        return this.state;
    }

    getStateDonJon(desiredState)  {
        let newState;
        switch(desiredState){
            case IDLE_DOWN:
                newState = {name: DON_JON, spriteX: POSITION_X,
                    spriteY: 0, currentState: IDLE_DOWN,
                    sheetWidth: 2, frames: 2 };

                break;

            case IDLE_LEFT:
                newState= {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON ,
                    currentState: IDLE_LEFT, sheetWidth: 2, frames: 2 };

                break;

            case IDLE_UP:
                newState = {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON * POSITION_2_MULT,
                    currentState: IDLE_UP, sheetWidth: 2, frames: 2 };
                break;

            case IDLE_RIGHT:
                newState = {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON * POSITION_3_MULT,
                    currentState: IDLE_RIGHT, sheetWidth: 2, frames: 2 };
                break;

            case RUNNING_DOWN:
                newState = {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON  * POSITION_4_MULT,
                    currentState: RUNNING_DOWN, sheetWidth: 2, frames: 2 };

                break;

            case RUNNING_LEFT:
                newState = {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON * POSITION_5_MULT,
                    currentState: RUNNING_LEFT, sheetWidth: 6, frames: 6};
                break;

            case RUNNING_UP:
                newState = {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON * POSITION_6_MULT,  currentState: RUNNING_UP,
                    sheetWidth: 2, frames: 2 };
                break;

            case RUNNING_RIGHT:
                newState = {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON * POSITION_7_MULT,
                    currentState:RUNNING_RIGHT, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_DOWN:
                newState = {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON * POSITION_8_MULT,
                    currentState: ATTACK_DOWN , sheetWidth: 5, frames: 5};
                break;

            case ATTACK_LEFT:
                newState= {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON * POSITION_9_MULT,
                    currentState: ATTACK_LEFT, sheetWidth: 4, frames: 4};
                break;

            case ATTACK_UP:
                newState = {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON * POSITION_10_MULT,
                    currentState: ATTACK_UP, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_RIGHT:
                newState = {name: DON_JON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DON_JON * POSITION_11_MULT,
                    currentState:ATTACK_RIGHT, sheetWidth: 4, frames: 4};
                break;
        }
        return newState;
    }


///// down, leftAnimation , right , up
    getStateGoblin(desiredState) {
        let newState;

        switch(desiredState){
            case IDLE_DOWN:
                newState = {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: 0, currentState: IDLE_DOWN,
                    sheetWidth: 2, frames: 2 };
                break;

            case IDLE_LEFT:
                newState= {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN ,
                    currentState: IDLE_LEFT, sheetWidth: 2, frames: 2 };

                break;

            case IDLE_UP:
                newState = {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN * POSITION_2_MULT,
                    currentState: IDLE_UP, sheetWidth: 2, frames: 2 };
                break;

            case IDLE_RIGHT:
                newState = {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN * POSITION_3_MULT,
                    currentState: IDLE_RIGHT, sheetWidth: 2, frames: 2 };
                break;

            case RUNNING_DOWN:
                newState = {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN  * POSITION_4_MULT,
                    currentState: RUNNING_DOWN, sheetWidth: 2, frames: 2 };

                break;

            case RUNNING_LEFT:
                newState = {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN * POSITION_5_MULT,
                    currentState: RUNNING_LEFT, sheetWidth: 6, frames: 6};
                break;

            case RUNNING_UP:
                newState = {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN * POSITION_6_MULT,  currentState: RUNNING_UP,
                    sheetWidth: 2, frames: 2 };
                break;

            case RUNNING_RIGHT:
                newState = {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN * POSITION_7_MULT,
                    currentState:RUNNING_RIGHT, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_DOWN:
                newState = {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN * POSITION_8_MULT,
                    currentState: ATTACK_DOWN , sheetWidth: 5, frames: 5};
                break;

            case ATTACK_LEFT:
                newState= {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN * POSITION_9_MULT,
                    currentState: ATTACK_LEFT, sheetWidth: 4, frames: 4};
                break;

            case ATTACK_UP:
                newState = {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN * POSITION_10_MULT,
                    currentState: ATTACK_UP, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_RIGHT:
                newState = {name: GOBLIN, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GOBLIN * POSITION_11_MULT,
                    currentState:ATTACK_RIGHT, sheetWidth: 4, frames: 4};
                break;
        }
        return newState;
    }

/// leftAnimation right up down, idle and attack.
    getStateBeholder(desiredState) {

        let newState;
        switch(desiredState){
            case IDLE_DOWN:
                newState = {name: BEHOLDER, spriteX: POSITION_X,
                    spriteY: 0, currentState: IDLE_DOWN,
                    sheetWidth: 2, frames: 2 };
                break;

            case IDLE_LEFT:
                newState= {name: BEHOLDER, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_BEHOLDER ,
                    currentState: IDLE_LEFT, sheetWidth: 2, frames: 2 };
                break;

            case IDLE_UP:
                newState = {name: BEHOLDER, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_BEHOLDER * POSITION_2_MULT,
                    currentState: IDLE_UP, sheetWidth: 2, frames: 2 };
                break;

            case IDLE_RIGHT:
                newState = {name: BEHOLDER, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_BEHOLDER * POSITION_3_MULT,
                    currentState: IDLE_RIGHT, sheetWidth: 2, frames: 2 };
                break;
            case ATTACK_DOWN:
                newState = {name: BEHOLDER, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_BEHOLDER * POSITION_8_MULT,
                    currentState: ATTACK_DOWN , sheetWidth: 5, frames: 5};
                break;

            case ATTACK_LEFT:
                newState= {name: BEHOLDER, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_BEHOLDER * POSITION_9_MULT,
                    currentState: ATTACK_LEFT, sheetWidth: 4, frames: 4};
                break;

            case ATTACK_UP:
                newState = {name: BEHOLDER, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_BEHOLDER * POSITION_10_MULT,
                    currentState: ATTACK_UP, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_RIGHT:
                newState = {name: BEHOLDER, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_BEHOLDER * POSITION_11_MULT,
                    currentState:ATTACK_RIGHT, sheetWidth: 4, frames: 4};
                break;
        }
        return newState;


    }

    getStateDemon(desiredState){

        let newState;

        switch(desiredState){
            case IDLE_DOWN:
                newState = {name: DEMON, spriteX: POSITION_X,
                    spriteY: 0, currentState: IDLE_DOWN,
                    sheetWidth: 2, frames: 2 };
                break;

            case IDLE_LEFT:
                newState= {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON ,
                    currentState: IDLE_LEFT, sheetWidth: 2, frames: 2 };

                break;

            case IDLE_UP:
                newState = {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON * POSITION_2_MULT,
                    currentState: IDLE_UP, sheetWidth: 2, frames: 2 };
                break;

            case IDLE_RIGHT:
                newState = {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON * POSITION_3_MULT,
                    currentState: IDLE_RIGHT, sheetWidth: 2, frames: 2 };
                break;

            case RUNNING_DOWN:
                newState = {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON  * POSITION_4_MULT,
                    currentState: RUNNING_DOWN, sheetWidth: 2, frames: 2 };

                break;

            case RUNNING_LEFT:
                newState = {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON * POSITION_5_MULT,
                    currentState: RUNNING_LEFT, sheetWidth: 6, frames: 6};
                break;

            case RUNNING_UP:
                newState = {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON * POSITION_6_MULT,  currentState: RUNNING_UP,
                    sheetWidth: 2, frames: 2 };
                break;

            case RUNNING_RIGHT:
                newState = {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON * POSITION_7_MULT,
                    currentState:RUNNING_RIGHT, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_DOWN:
                newState = {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON * POSITION_8_MULT,
                    currentState: ATTACK_DOWN , sheetWidth: 5, frames: 5};
                break;

            case ATTACK_LEFT:
                newState= {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON * POSITION_9_MULT,
                    currentState: ATTACK_LEFT, sheetWidth: 4, frames: 4};
                break;

            case ATTACK_UP:
                newState = {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON * POSITION_10_MULT,
                    currentState: ATTACK_UP, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_RIGHT:
                newState = {name: DEMON, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_DEMON * POSITION_11_MULT,
                    currentState:ATTACK_RIGHT, sheetWidth: 4, frames: 4};
                break;
        }
        return newState;
    }

    getStateWraith(desiredState) {

        let newState;

        switch(desiredState){
            case IDLE_DOWN:
                newState = {name: WRAITH, spriteX: POSITION_X,
                    spriteY: 0, currentState: IDLE_DOWN,
                    sheetWidth: 2, frames: 2 };
                break;

            case IDLE_LEFT:
                newState= {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH ,
                    currentState: IDLE_LEFT, sheetWidth: 2, frames: 2 };

                break;

            case IDLE_UP:
                newState = {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH * POSITION_2_MULT,
                    currentState: IDLE_UP, sheetWidth: 2, frames: 2 };
                break;

            case IDLE_RIGHT:
                newState = {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH * POSITION_3_MULT,
                    currentState: IDLE_RIGHT, sheetWidth: 2, frames: 2 };
                break;

            case RUNNING_DOWN:
                newState = {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH  * POSITION_4_MULT,
                    currentState: RUNNING_DOWN, sheetWidth: 2, frames: 2 };

                break;

            case RUNNING_LEFT:
                newState = {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH * POSITION_5_MULT,
                    currentState: RUNNING_LEFT, sheetWidth: 6, frames: 6};
                break;

            case RUNNING_UP:
                newState = {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH * POSITION_6_MULT,  currentState: RUNNING_UP,
                    sheetWidth: 2, frames: 2 };
                break;

            case RUNNING_RIGHT:
                newState = {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH * POSITION_7_MULT,
                    currentState:RUNNING_RIGHT, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_DOWN:
                newState = {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH * POSITION_8_MULT,
                    currentState: ATTACK_DOWN , sheetWidth: 5, frames: 5};
                break;

            case ATTACK_LEFT:
                newState= {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH * POSITION_9_MULT,
                    currentState: ATTACK_LEFT, sheetWidth: 4, frames: 4};
                break;

            case ATTACK_UP:
                newState = {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH * POSITION_10_MULT,
                    currentState: ATTACK_UP, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_RIGHT:
                newState = {name: WRAITH, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_WRAITH * POSITION_11_MULT,
                    currentState:ATTACK_RIGHT, sheetWidth: 4, frames: 4};
                break;
        }
        return newState;

    }

    getStateImp(desiredState) {
        let newState;

        switch(desiredState){
            case IDLE_DOWN:
                newState = {name: IMP, spriteX: POSITION_X,
                    spriteY: 0, currentState: IDLE_DOWN,
                    sheetWidth: 2, frames: 2 };
                break;

            case IDLE_LEFT:
                newState= {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP ,
                    currentState: IDLE_LEFT, sheetWidth: 2, frames: 2 };

                break;

            case IDLE_UP:
                newState = {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP * POSITION_2_MULT,
                    currentState: IDLE_UP, sheetWidth: 2, frames: 2 };
                break;

            case IDLE_RIGHT:
                newState = {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP * POSITION_3_MULT,
                    currentState: IDLE_RIGHT, sheetWidth: 2, frames: 2 };
                break;

            case RUNNING_DOWN:
                newState = {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP  * POSITION_4_MULT,
                    currentState: RUNNING_DOWN, sheetWidth: 2, frames: 2 };

                break;

            case RUNNING_LEFT:
                newState = {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP * POSITION_5_MULT,
                    currentState: RUNNING_LEFT, sheetWidth: 6, frames: 6};
                break;

            case RUNNING_UP:
                newState = {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP * POSITION_6_MULT,  currentState: RUNNING_UP,
                    sheetWidth: 2, frames: 2 };
                break;

            case RUNNING_RIGHT:
                newState = {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP * POSITION_7_MULT,
                    currentState:RUNNING_RIGHT, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_DOWN:
                newState = {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP * POSITION_8_MULT,
                    currentState: ATTACK_DOWN , sheetWidth: 5, frames: 5};
                break;

            case ATTACK_LEFT:
                newState= {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP * POSITION_9_MULT,
                    currentState: ATTACK_LEFT, sheetWidth: 4, frames: 4};
                break;

            case ATTACK_UP:
                newState = {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP * POSITION_10_MULT,
                    currentState: ATTACK_UP, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_RIGHT:
                newState = {name: IMP, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_IMP * POSITION_11_MULT,
                    currentState:ATTACK_RIGHT, sheetWidth: 4, frames: 4};
                break;
        }
        return newState;

    }

// same states as beholder
    getStateGargoyle(desiredState) {

        let newState;
        switch(desiredState){
            case IDLE_DOWN:
                newState = {name: GARGOYLE, spriteX: POSITION_X,
                    spriteY: 0, currentState: IDLE_DOWN,
                    sheetWidth: 2, frames: 2 };
                break;

            case IDLE_LEFT:
                newState= {name: GARGOYLE, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GARGOYLE ,
                    currentState: IDLE_LEFT, sheetWidth: 2, frames: 2 };
                break;

            case IDLE_UP:
                newState = {name: GARGOYLE, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GARGOYLE * POSITION_2_MULT,
                    currentState: IDLE_UP, sheetWidth: 2, frames: 2 };
                break;

            case IDLE_RIGHT:
                newState = {name: GARGOYLE, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GARGOYLE * POSITION_3_MULT,
                    currentState: IDLE_RIGHT, sheetWidth: 2, frames: 2 };
                break;
            case ATTACK_DOWN:
                newState = {name: GARGOYLE, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GARGOYLE * POSITION_8_MULT,
                    currentState: ATTACK_DOWN , sheetWidth: 5, frames: 5};
                break;

            case ATTACK_LEFT:
                newState= {name: GARGOYLE, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GARGOYLE * POSITION_9_MULT,
                    currentState: ATTACK_LEFT, sheetWidth: 4, frames: 4};
                break;

            case ATTACK_UP:
                newState = {name: GARGOYLE, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GARGOYLE * POSITION_10_MULT,
                    currentState: ATTACK_UP, sheetWidth: 6, frames: 6};
                break;

            case ATTACK_RIGHT:
                newState = {name: GARGOYLE, spriteX: POSITION_X,
                    spriteY: Y_LOCATION_GARGOYLE * POSITION_11_MULT,
                    currentState:ATTACK_RIGHT, sheetWidth: 4, frames: 4};
                break;
        }
        return newState;



    }

/// different attacks stomp, fireball,
    getStateDragon(desiredState) {

    }

}
