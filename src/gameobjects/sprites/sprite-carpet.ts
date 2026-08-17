import { STATIC_PLATFORM_KEY } from "../../constants/keys";
import { SpriteSimple } from "./sprite-simple";

const SCALE = 2;

export class SpriteCarpet extends SpriteSimple {

    constructor(scene: Phaser.Scene) {
        super(scene, STATIC_PLATFORM_KEY, 6, true);

        /*
        this.setBodySizeOffset(
            48 * SCALE,
            4,
            0,
            -4
        );
        */

        
        this.body.checkCollision.down = false;
        this.body.checkCollision.left = false;
        this.body.checkCollision.right = false;
        
        this.body.setSize(48, 4);
        this.body.setOffset(20, 12);
        
    }
}