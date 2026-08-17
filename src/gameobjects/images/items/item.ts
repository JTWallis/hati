import { ICON_ITEM_CONTAINER_KEY } from "../../../constants/keys";
import type { Powerup } from "../../../powerups/powerup";
import { ImageCollidable } from "../image-collidable";


export abstract class Item extends ImageCollidable {

    protected powerup: Powerup;
    private item: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, itemTexture: string, powerup: Powerup) {
        super(scene, ICON_ITEM_CONTAINER_KEY);
        this.powerup = powerup;
        this.item = scene.add.image(0, 0, itemTexture);
        this.item.setAlpha(0.8);
    }

    
    public override enableBody(reset?: boolean, x?: number, y?: number, enableGameObject?: boolean, showGameObject?: boolean): this {
        if(showGameObject && x && y) {
            this.item.setPosition(x, y);
            this.item.setVisible(true);
        }

        return super.enableBody(reset, x, y, enableGameObject, showGameObject);
    }

    public override disableBody(disableGameObject?: boolean, hideGameObject?: boolean): this {
        if(hideGameObject) {
            this.item.setVisible(false);
        }
        return super.disableBody(disableGameObject, hideGameObject);
    }

    
    public override setPosition(x?: number, y?: number, z?: number, w?: number): this {
        if(x && y) {
            this.item.setPosition(x, y);
        }

        return super.setPosition(x, y, z, w);
    }
    
    public override setVisible(value: boolean): this {
        this.item.setVisible(value);
        return super.setVisible(value);
    }
    

    public getItemImage(): Phaser.GameObjects.Image {
        return this.item;
    }

    public getItemTexture(): string {
        return this.item.texture.key;
    }

    public getPowerup(): Powerup {
        return this.powerup;
    }
}