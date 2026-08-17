import type { Item } from "../gameobjects/images/items/item";
import type { Powerup } from "../powerups/powerup";
import { PowerupArrows } from "../powerups/powerup-arrows";
import { PowerupWingedTread } from "../powerups/powerup-winged-tread";
import { PowerupShield } from "../powerups/powerup-shield";
import { PowerupRam } from "../powerups/powerup-ram";

interface PowerupManagerApi {
    onItemPickup: (item: Item) => void;
    setOverlayTexture: (texture: string) => void;
    setOverlayVisible: (visible: boolean) => void;
    startOverlayCooldown: (cooldownMs: number) => void;
}

export class PowerupManager {
    public readonly powerupArrows = new PowerupArrows();
    public readonly powerupShield = new PowerupShield();
    public readonly powerupWingedTread = new PowerupWingedTread();
    public readonly powerupRam = new PowerupRam();

    private powerupOnCooldown: boolean = false;
    private api: PowerupManagerApi;

    constructor(api: PowerupManagerApi) {
        this.api = api;
    }

    public onItemPickup(item: Item) {
        this.api.onItemPickup(item);

        const powerup = item.getPowerup();

        if(!powerup.isPassivePowerup) {
            this.api.setOverlayTexture(item.getItemTexture());
            this.api.setOverlayVisible(true);
        }

    }

    public onPowerupFinish(powerup: Powerup) {
        if(!powerup.isPassivePowerup) {
            this.api.setOverlayVisible(false);
        }
    }

    public createPowerupCooldown(cooldownMs: number, clock: Phaser.Time.Clock) {
        this.powerupOnCooldown = true;
        clock.delayedCall(cooldownMs, () => this.powerupOnCooldown = false);
        this.api.startOverlayCooldown(cooldownMs);
    }

    public isPowerupOnCooldown(): boolean {
        return this.powerupOnCooldown;
    }

    public cleanup() {
        const powerups = [
            this.powerupArrows,
            this.powerupShield,
            this.powerupWingedTread,
            this.powerupRam
        ];

        for(const p of powerups) {
            p.cleanup();
        }
    }
}