import { Powerup } from "./powerup";
import type { PowerupAttackSpecialParams, PowerupCollisionParams, PowerupStartParams } from "./powerup-params";

const DURATION_RAM_MS = 400;
const DURATION_COMPLETE_MS = 400;

const MAX_RAMS = 4;

export class PowerupRam extends Powerup {

    public override readonly isPassivePowerup = false;
    public override readonly usesStart = true;
    public override readonly usesRefresh = true;
    public override readonly usesPlayerDamaged = true;
    public override readonly usesInputAttackSpecial = true;

    private currentRams = 0;

    public override onStart(params: PowerupStartParams): void {
        this.refreshRams(params);
    }

    public override onRefresh(params: PowerupStartParams): void {
        this.refreshRams(params);
    }

    public override onPlayerDamaged(params: PowerupCollisionParams): boolean {
        if(params.isRamming) {
            params.api.damageHostile(params.collided, params.collidedType);
        }

        return !params.isRamming;
    }

    public override onInputAttackSpecial(params: PowerupAttackSpecialParams): void {
        if(params.isRamming) return;

        params.api.dash(DURATION_RAM_MS, false, DURATION_COMPLETE_MS);
        params.api.createSpecialCooldown(DURATION_RAM_MS + DURATION_COMPLETE_MS)

        this.currentRams--;
        params.api.setOverlayCount(this.currentRams);
        
        if(this.currentRams <= 0) {
            params.api.finishPowerup(this);
        }
    }

    private refreshRams(params: PowerupStartParams) {
        this.currentRams = MAX_RAMS;
        params.api.setOverlayCount(this.currentRams);
    }

}