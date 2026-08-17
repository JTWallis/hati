import { ICON_ITEM_WINGED_TREAD_KEY } from "../../../constants/keys";
import type { PowerupWingedTread } from "../../../powerups/powerup-winged-tread";
import { Item } from "./item";

export class ItemWingedTread extends Item {

    constructor(scene: Phaser.Scene, powerup: PowerupWingedTread) {
        super(scene, ICON_ITEM_WINGED_TREAD_KEY, powerup);
    }
}