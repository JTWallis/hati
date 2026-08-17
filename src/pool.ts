import type { GameObject } from "./gameobjects/gameobject";
import { PoolObject } from "./pool-object";

export class Pool {

    private pool: PoolObject[];
    private inUseIndices: number[];

    constructor(objects: GameObject[]) {
        
        this.pool = objects.map(e => new PoolObject(e));
        

        this.inUseIndices = [];
    }

    public reuse(x?: number, y?: number): GameObject | null {
        if(this.inUseIndices.length >= this.pool.length) {
            let warn = "Pool exhausted. Active Objects [" + this.inUseIndices.length + "]:\n";
            this.inUseIndices.forEach((idx) => {
                const poolObj = this.pool[idx];
                const key = poolObj.getGameObject().getTextureKey() + "-" + poolObj.getGameObject().getId();
                const sprite = poolObj.getGameObject().getObject();
                warn += key + `${key} ; inUse ${poolObj.isUsed()} ; x ${sprite.x} y ${sprite.y}\n`;
            });
            console.warn(warn);
            return null;
        }

        for(let i = 0; i < this.pool.length; i++) {
            const obj = this.pool[i];
            if(!obj) {
                console.error("Got null obj in Pool.reuse");
                continue;
            }

            if(!obj.isUsed()) {
                return this.reuseObj(obj, x, y);
            }
        }

        let warn = "Iterated all but no in use??. Active Objects [" + this.inUseIndices.length + "]:\n";
            this.pool.forEach((poolObj) => {
                const key = poolObj.getGameObject().getTextureKey() + "-" + poolObj.getGameObject().getId();
                const sprite = poolObj.getGameObject().getObject();
                warn += `${key} ; inUse ${poolObj.isUsed()} ; x ${sprite.x} y ${sprite.y}\n`;
            });
            console.warn(warn);
        return null;
    }

    public reuseAt(index: number, x?: number, y?: number): GameObject | null {
        if(this.inUseIndices.length >= this.pool.length) return null;
        if(index < 0 || index >= this.pool.length) {
            console.error("Index out of bounds in Pool.reuseAt");
            return null;
        }

        const obj = this.pool[index];
        return this.reuseObj(obj, x, y);
    }

    private reuseObj(obj: PoolObject, x?: number, y?: number): GameObject {
        obj.onUse(x, y);
        this.inUseIndices.push(obj.getGameObject().getId());
        return obj.getGameObject();
    }

    public reserve(gameObject: GameObject): void {
        if(this.inUseIndices.length === 0) {
            console.warn("No objects in use tho.");
            return;
        }

        const idx = gameObject.getId();
        if(idx < 0 || idx >= this.pool.length) {
            console.error("Index out of bounds in Pool.reserve");
            return;
        }

        const obj = this.pool[idx];
        this.reserveObj(obj, idx);
    }

    public reserveAnyActives(reserveCondition: (obj: GameObject) => boolean) {
        // If despawning ever makes problems, try copying the indices array e.g. with slice().
        for(const idx of this.inUseIndices) {
            const poolObj = this.pool[idx];
            if(reserveCondition(poolObj.getGameObject()) === true) {
                this.reserveObj(poolObj, idx);
            }
        }
    }

    public reserveAll() {
        this.pool.forEach((obj, idx) => {
            this.reserveObj(obj, idx);
        });
    }

    private reserveObj(obj: PoolObject, idx: number) {
        obj.onReserve();
        const inUsePosition = this.inUseIndices.indexOf(idx);
        if(inUsePosition >= 0) this.inUseIndices.splice(inUsePosition, 1);
    }

    public getObjects(): GameObject[] {
        return this.pool.map(e => e.getGameObject());
    }
}