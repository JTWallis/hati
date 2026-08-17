import { STATIC_LAVA_KEY } from "../../constants/keys";
import { ImageCollidable } from "./image-collidable";


export class ImageLava extends ImageCollidable {

    constructor(scene: Phaser.Scene) {
        super(scene, STATIC_LAVA_KEY);

        this.body.checkCollision.down = false;
        //this.body.checkCollision.left = false;
        this.body.checkCollision.right = false;
    }

}