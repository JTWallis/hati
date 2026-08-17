import type { PowerupAttackSpecialParams, PowerupCollisionParams, PowerupMoveParams, PowerupStartParams } from "./powerup-params";

export class Powerup {

    public readonly isPassivePowerup: boolean = false;
    public readonly usesStart: boolean = false;
    public readonly usesRefresh: boolean = false;
    public readonly usesUpdate: boolean = false;
    public readonly usesPlayerDamaged: boolean = false;
    public readonly usesHostileDamaged: boolean = false;
    public readonly usesInputAttackSpecial: boolean = false;
    public readonly usesInputMove: boolean = false;
    public readonly usesInputJump: boolean = false;

    public onStart(params: PowerupStartParams) { }
    public onRefresh(params: PowerupStartParams) {  }
    public onUpdate() { }
    public onPlayerDamaged(params: PowerupCollisionParams): boolean { return true; }
    public onHostileDamaged(params: PowerupCollisionParams) { }
    public onInputAttackSpecial(params: PowerupAttackSpecialParams) {  }
    public onInputMove(params: PowerupMoveParams) {  }
    public onInputJump() { }
    public onEnd() {  }

    public cleanup() {}
}