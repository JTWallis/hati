import { PROJECTILE_ARROW_KEY } from "../constants/keys";
import { Powerup } from "./powerup";
import type { PowerupAttackSpecialParams, PowerupStartParams } from "./powerup-params";

const ARROW_COOLDOWN_MS = 200;
const MAX_ARROWS = 8;

export class PowerupArrows extends Powerup {

    public override readonly usesStart = true;
    public override readonly usesRefresh = true;
    public override readonly usesInputAttackSpecial = true;

    private textureKey = PROJECTILE_ARROW_KEY;

    private currentArrows: number = 0;

    public override onStart(params: PowerupStartParams) {
        this.refreshArrows(params);
    }

    public override onRefresh(params: PowerupStartParams) {
        this.refreshArrows(params);
    }

    private refreshArrows(params: PowerupStartParams) {
        this.currentArrows = MAX_ARROWS;
        params.api.setOverlayCount(this.currentArrows);
    }

    public override onInputAttackSpecial(params: PowerupAttackSpecialParams) {
        if(!params.api.spawnProjectileAnim) {
            console.warn("No spawnProjectileCallback set in PowerupArrows.onInputAttackSpecial");
            return;
        }

        if(params.api.isSpecialOnCooldown()) {
            return;
        }

        params.api.createSpecialCooldown(ARROW_COOLDOWN_MS);
        params.api.spawnProjectileAnim(this.textureKey, params.pointerX, params.pointerY);

        this.currentArrows--;
        params.api.setOverlayCount(this.currentArrows);

        if(this.currentArrows <= 0) {
            params.api.finishPowerup(this);
        }
    }

}