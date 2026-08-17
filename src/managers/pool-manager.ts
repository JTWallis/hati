import type { Image } from "../gameobjects/images/image";
import { Sprite } from "../gameobjects/sprites/sprite";
import { Pool } from "../pool"
import { GameObject } from "../gameobjects/gameobject";

export const DEFAULT_POOL_SIZE = 4;

export class PoolManager {

    private pools: Map<string, Pool>;

    constructor() {
        this.pools = new Map();
    }

    public createPool(textureKey: string, factory: () => Sprite | Image, poolSize: number = DEFAULT_POOL_SIZE) {
        if(this.pools.has(textureKey)) return;

        let idx = 0;
        this.pools.set(
            textureKey,
            new Pool(Array.from(
                { length: poolSize },
                () => {
                    const obj = factory();
                    const gameObj = new GameObject(obj, idx++);
                    obj.initGameObject(gameObj);
                    return gameObj;
                }
            ))
        );
    }

    public createSpecificPool(poolKey: string, ...factories: ({ index: number, factory: () => Sprite | Image })[]) {
        if(this.pools.has(poolKey)) return;

        this.pools.set(
            poolKey,
            new Pool(factories.map((specificObj) => {
                const obj = specificObj.factory();
                const gameObj = new GameObject(obj, specificObj.index, poolKey);
                obj.initGameObject(gameObj);
                return gameObj;
            }))
        );
    }

    public reuseObject(textureKey: string, x?: number, y?: number): GameObject | null {
        const pool = this.pools.get(textureKey);
        if(!pool) {
            console.error(`Tried to get non-existing Pool ${textureKey} in PoolManager.reuseObject`);
            return null;
        }

        const obj = pool.reuse(x, y);
        return obj;
    }

    public reuseSpecificObject(poolKey: string, poolObjIndex: number, x?: number, y?: number): GameObject | null {
        const pool = this.pools.get(poolKey);
        if(!pool) {
            console.error(`Tried to get non-existing Pool ${poolKey} in PoolManager.reuseSpecificObject`);
            return null;
        }

        return pool.reuseAt(poolObjIndex, x, y);
    }

    public reserveObject(object: GameObject) {
        const pool = this.pools.get(object.getTextureKey());
        if(!pool) {
            console.error(`Tried to get non-existing Pool ${object.getTextureKey()} in PoolManager.reserveObject`);
            return;
        }

        pool.reserve(object);
    }

    public reserveActiveObjects(reserveCondition: (obj: GameObject) => boolean) {
        this.pools.forEach((pool) => {
            pool.reserveAnyActives(reserveCondition);
        });
    }

    public reserveAllObjects() {
        this.pools.forEach((pool) => {
            pool.reserveAll();
        });
    }

    public pauseAllObjects() {
        for(const [key] of this.pools) {
            this.getObjects(key).forEach(obj => obj.pause());
        }
    }

    public resetAllObjects() {
        for(const [key] of this.pools) {
            this.getObjects(key).forEach(obj => obj.reset());
        }
    }

    public findObject(object: Sprite | Image) : GameObject | null {
        const textureKey = object.texture.key;
        const found = this.getObjects(textureKey).find(e => e.getObject() === object);    
        if(!found) {
            console.error(`Could not find GameObject ${textureKey} in PoolManager.findObject`);
            return null;
        }

        return found;
    }

    public getObjects(textureKey: string): GameObject[] | null {
        const pool = this.pools.get(textureKey);
        if(!pool) {
            console.error(`Tried to get non-existing Pool ${textureKey} in PoolManager.getObjects`);
            return null;
        }

        return pool.getObjects();
    }

}