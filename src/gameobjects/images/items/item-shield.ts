import { ICON_ITEM_SHIELD_KEY } from "../../../constants/keys";
import type { PowerupShield } from "../../../powerups/powerup-shield";
import { Item } from "./item";


export class ItemShield extends Item {

    constructor(scene: Phaser.Scene, powerup: PowerupShield) {
        super(scene, ICON_ITEM_SHIELD_KEY, powerup);
    }
}