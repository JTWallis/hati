import type { GameObject } from "./gameobjects/gameobject";

export class PoolObject {

    private gameObj: GameObject;
    private inUse: boolean;

    constructor(object: GameObject) {
        this.gameObj = object;
        this.onReserve();
    }

    public onUse(x?: number, y?: number): void {
        this.inUse = true;
        this.gameObj.onUse(x, y);
    }

    public onReserve(): void {
        this.inUse = false;
        this.gameObj.onReserve();
    }

    public getGameObject(): GameObject {
        return this.gameObj;
    }

    public isUsed(): boolean {
        return this.inUse;
    }

}