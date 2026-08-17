import * as Phaser from "phaser";
import { Overlay } from "./overlay";
import { OVERLAY_POWERUP_KEY } from "../../constants/keys";

export class CooldownOverlay extends Overlay {
    protected cover: Phaser.GameObjects.Graphics;
    private item: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, OVERLAY_POWERUP_KEY);

        this.cover = this.scene.add.graphics();
        this.item = scene.add.image(0, 0, OVERLAY_POWERUP_KEY);
        this.add([this.item, this.cover]);

        this.cover.clear();
    }

    public startCooldown(cooldownMs: number) {
        this.scene.tweens.addCounter({
            from: 0,
            to: cooldownMs,
            duration: cooldownMs,
            ease: "Linear",
            onUpdate: (tween) => {
                this.updateCover(tween.progress);
            },
            onComplete: () => {
                this.cover.clear();
            }
        })
    }

    public setTexture(itemTexture: string) {
        this.item.setTexture(itemTexture);
    }

    private updateCover(progress: number) {
        this.cover.clear();
        this.cover.fillStyle(0xff0000, 0.5);
        
        const radius = 16;

        this.cover.slice(
            0, 0, radius,
            Phaser.Math.DegToRad(-90),
            Phaser.Math.DegToRad(-90 + 360 * progress),
            true
        );

        this.cover.fillPath();
    }
} 