import { ICON_ITEM_ARROWS_KEY } from "../../../constants/keys";
import { PowerupArrows } from "../../../powerups/powerup-arrows";
import { Item } from "./item";


export class ItemArrows extends Item {

    constructor(scene: Phaser.Scene, powerup: PowerupArrows) {
        super(scene, ICON_ITEM_ARROWS_KEY, powerup);
    }
}