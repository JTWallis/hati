import { ANIM_SLASH_KEY } from "../../constants/keys";
import { Sprite } from "./sprite";

export class AnimSlash extends Sprite {

    constructor(scene: Phaser.Scene, attackCompleteCallback: () => void) {
        super(scene, ANIM_SLASH_KEY, true, 1);

        this.setBodySize(48, 24);

        this.anims.create({
            key: "default",
            frames: this.anims.generateFrameNumbers(this.texture.key, { start: 0, end: 7 }),
            frameRate: 60
        });

        this.on("animationcomplete-default", () => attackCompleteCallback());
    }

    public activate(): void {
        this.anims.play("default", true);
    }

}