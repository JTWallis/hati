import { FILTER_RAINBOW } from "../constants/keys";
import type { RainbowShimmerController } from "../filters/FilterRainbowShimmer";
import { Powerup } from "./powerup";
import type { PowerupCollisionParams, PowerupStartParams } from "./powerup-params";

const DURATION_START_MS = 1000;
const DURATION_RAINBOW_MS = 8000;
const DURATION_COMPLETE_MS = 2000;

const INTENSITY_BASE = 0.5;

export class PowerupWingedTread extends Powerup {

    public override readonly isPassivePowerup = true;
    public override readonly usesStart = true;
    public override readonly usesRefresh = true;
    public override readonly usesPlayerDamaged = true;
    private startTween: Phaser.Tweens.Tween | null;
    private treadTween: Phaser.Tweens.Tween | null;

    public override onStart(params: PowerupStartParams): void {
        let rainbow: RainbowShimmerController; 

        this.resetStartTween();
        this.resetTreadTween();
        
        this.startTween = params.api.getTweens().addCounter({
            duration: DURATION_START_MS,
            onStart: () => {
                // Case of redundantly adding same filter to same object is handled by filter manager.
                rainbow = params.api.addPlayerFilter(FILTER_RAINBOW) as RainbowShimmerController;
                rainbow.intensity = 0.0;
                params.api.setRamming(true);
            },
            onUpdate: (tween) => {
                rainbow.intensity = tween.progress * INTENSITY_BASE;
            },
            onComplete: () => {
                this.startTween = null;
                this.onTread(params, rainbow);
            }
        })
        
    }

    private onTread(params: PowerupStartParams, rainbow: RainbowShimmerController) {
        const progressWeaken = 0.65;
        let treadComplete = false;
        rainbow.intensity = INTENSITY_BASE;

        this.treadTween = params.api.getTweens().addCounter({
            duration: DURATION_RAINBOW_MS + DURATION_COMPLETE_MS,
            onStart: () => {
                params.api.dash(DURATION_RAINBOW_MS, true, DURATION_COMPLETE_MS);
            },
            onUpdate: (tween) => {
                const treadProgress = tween.elapsed / DURATION_RAINBOW_MS;
                if(!treadComplete && tween.elapsed >= DURATION_RAINBOW_MS) {
                    treadComplete = true;
                    rainbow.intensity = 0.15;
                } else if(!treadComplete && treadProgress >= progressWeaken) {
                    rainbow.intensity = INTENSITY_BASE - (treadProgress - progressWeaken)
                }
            },
            onComplete: () => {
                this.treadTween = null;
                params.api.removePlayerFilter(FILTER_RAINBOW);
                params.api.finishPowerup(this);
            }
        });
    }

    public override onRefresh(params: PowerupStartParams): void {
        this.resetStartTween();

        if(!this.treadTween) {
            console.warn("Refreshed rainbow but tween ran out!");
            this.onStart(params);
            return;
        }

        this.treadTween.restart();
    }

    public override onPlayerDamaged(params: PowerupCollisionParams): boolean {
        params.api.damageHostile(params.collided, params.collidedType);
        return false;
    }

    private resetStartTween() {
        if(this.startTween) {
            this.startTween.stop();
            this.startTween = null;
        }
    }

    private resetTreadTween() {
        if(this.treadTween) {
            this.treadTween.stop();
            this.treadTween = null;
        }
    }

    public override cleanup(): void {
        this.resetStartTween();
        this.resetTreadTween();
    }
}