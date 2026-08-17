import * as Phaser from "phaser";
import { FILTER_GLOW, FILTER_OUTLINE } from "../constants/keys";
import { ObjectType } from "../enums/object-type";
import { Powerup } from "./powerup";
import type { PowerupCollisionParams, PowerupStartParams } from "./powerup-params";
import type { EdgeOutlineController } from "../filters/FilterOutline";

export class PowerupShield extends Powerup {

    public override readonly isPassivePowerup = true;
    public override readonly usesStart = true;
    public override readonly usesPlayerDamaged = true;
    private tween: Phaser.Tweens.Tween | null;

    public override onStart(params: PowerupStartParams): void {
        const outline = params.api.addPlayerFilter(FILTER_OUTLINE) as EdgeOutlineController;
        const glow = params.api.addPlayerFilter(FILTER_GLOW) as Phaser.Filters.Glow;
        
        outline.color = [0.7, 0.45, 0.1, 1.0];

        glow.color = 0xDAA520;
        glow.outerStrength = 1.0;
        glow.innerStrength = 0.2;
        glow.scale = 1.0;

        if(this.tween) {
            console.warn("Already had tween on shield powerup");
            this.tween.stop();
        }

        this.tween = params.api.getTweens().addCounter({
            from: 0,
            to: Math.PI,
            duration: 4000,
            ease: "Linear",
            loop: -1,
            onUpdate: (tween) => {
                glow.outerStrength = 0.5 + Math.sin(tween.getValue()) * 1.5;
            }
        });
        
    }

    public override onPlayerDamaged(params: PowerupCollisionParams): boolean {
        if(params.isRamming) return false;
        if(params.collidedType === ObjectType.STATIC) return true;

        if(this.tween) {
            this.tween.stop();
            this.tween = null;
        }

        // Unused stub for reflecting projectiles back to sender
        /*
        if(params.collidedType === ObjectType.PROJECTILE) {
            (params.collided.getObject() as ProjectileFire).reflect(true);
            console.warn("REFLECT projectile");
        } else {
            params.api.damageHostile(params.collided, params.collidedType);
        }
        */

        params.api.damageHostile(params.collided, params.collidedType);

        params.api.removePlayerFilter(FILTER_GLOW);
        params.api.removePlayerFilter(FILTER_OUTLINE);
        params.api.finishPowerup(this);
    }

    public override cleanup(): void {
        if(this.tween) {
            this.tween.stop();
            this.tween = null;
        }
    }
}