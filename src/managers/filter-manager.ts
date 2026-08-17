import * as Phaser from "phaser";
import { FILTER_DEATH_SPLIT, FILTER_GLOW, FILTER_OUTLINE, FILTER_RAINBOW } from "../constants/keys";
import { DeathSplitController } from "../filters/FilterDeathSplit";
import { EdgeOutlineController } from "../filters/FilterOutline";
import { RainbowShimmerController } from "../filters/FilterRainbowShimmer";
import type { GameObject } from "../gameobjects/gameobject";

interface FilterObjPair {
    filter: Phaser.Filters.Controller;
    gameObj: GameObject;
}

export class FilterManager {

    private readonly controllerFactories: Map<string, (camera: Phaser.Cameras.Scene2D.Camera) => Phaser.Filters.Controller>;
    private activeFilters: Map<string, FilterObjPair>;
    
    constructor() {
        this.controllerFactories = new Map();
        this.activeFilters = new Map();

        this.controllerFactories.set(FILTER_DEATH_SPLIT, (camera) => new DeathSplitController(camera));
        this.controllerFactories.set(FILTER_OUTLINE, (camera) => new EdgeOutlineController(camera));
        this.controllerFactories.set(FILTER_GLOW, (camera) => new Phaser.Filters.Glow(camera, 0xFFFFFF, 1.0, 0.5, 1.0, false, 5.0, 6.0));
        this.controllerFactories.set(FILTER_RAINBOW, (camera) => new RainbowShimmerController(camera));
    }

    public addFilter(filterKey: string, gameObj: GameObject): Phaser.Filters.Controller | null {
        const controllerFactory = this.controllerFactories.get(filterKey);
        if(!controllerFactory) {
            console.warn(`Tried to add invalid filter ${filterKey}`);
            return null;
        }
        
        const id = this.getFilterId(filterKey, gameObj);
        if(this.activeFilters.has(id)) {
            console.warn(`Tried to add already existing filter ${filterKey}`);
            return this.activeFilters.get(id).filter;
        }

        const filterCamera = gameObj.getObject().filterCamera;
        const controller = controllerFactory(filterCamera);
        const filter = gameObj.getObject().filters.internal.add(controller);

        this.activeFilters.set(id, { filter, gameObj });

        return filter;
    }

    public removeFilter(filterKey: string, gameObj: GameObject) {
        const id = this.getFilterId(filterKey, gameObj);
        const filterPair = this.activeFilters.get(id);
        if(!filterPair) {
            console.warn(`Tried to remove non-existing filter ${id}`);
            return;
        }

        this.removeFromObj(filterPair);
        this.activeFilters.delete(id);
    }

    private removeFromObj(filterPair: FilterObjPair) {
        filterPair.gameObj.getObject().filters.internal.remove(filterPair.filter);
    }

    public cleanup() {
        this.activeFilters.forEach(filterPair => this.removeFromObj(filterPair));
        this.activeFilters.clear();
    }

    private getFilterId(key: string, gameObject: GameObject): string {
        return `${key}-${gameObject.getTextureKey()}-${gameObject.getId()}`;
    }

}