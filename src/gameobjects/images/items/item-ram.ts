
import { ICON_ITEM_RAM_KEY } from "../../../constants/keys";
import type { PowerupRam } from "../../../powerups/powerup-ram";
import { Item } from "./item";

export class ItemRam extends Item {

    constructor(scene: Phaser.Scene, powerup: PowerupRam) {
        super(scene, ICON_ITEM_RAM_KEY, powerup);
    }
}