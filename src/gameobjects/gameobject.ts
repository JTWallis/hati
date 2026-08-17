import { GameObjectState } from "../enums/gameobject-state";
import type { Image } from "./images/image"
import type { Sprite } from "./sprites/sprite"

export class GameObject {
    private object: Sprite | Image;
    private id: number;
    private textureKey: string | null;
    private state: GameObjectState;

    constructor(object: Sprite | Image, id: number, textureKey?: string) {
        this.object = object;
        this.id = id;
        this.textureKey = textureKey;
        this.state = GameObjectState.DESPAWNED;
    }

    public disableBody(hide: boolean = true) {
        if(this.getObject().body) {
            this.getObject().disableBody(true, hide);
        } else {
            this.getObject().setVisible(false);
        }
    }

    public setState(state: GameObjectState) {
        this.state = state;
    }

    public pause() {
        this.getObject().pause();
    }

    public reset() {
        this.getObject().reset();
    }

    public onUse(x?: number, y?: number) {
        const reset = (x !== undefined && y !== undefined);
        if(this.getObject().body) {
            this.getObject().enableBody(reset, x, y, true, true);
        } else {
            this.getObject().setPosition(x, y);
            this.getObject().setVisible(true);
        }


        this.getObject().onUse();
    }

    public onReserve() {
        this.disableBody();
        this.getObject().onReserve();
    }

    public getObject(): Sprite | Image {
        return this.object;
    }

    public getTextureKey(): string {
        return this.textureKey ?? this.object.texture.key;
    }

    public getId(): number {
        return this.id;
    }

    public getState(): GameObjectState {
        return this.state;
    }
}