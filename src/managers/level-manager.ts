import * as Phaser from "phaser";
import { ENTITY_EAGLE_KEY, STATIC_BG_MORNING_KEY, STATIC_GROUND_KEY, ICON_ITEM_ARROWS_KEY, STATIC_LAVA_KEY, STATIC_PLATFORM_KEY, POOL_ITEMS_KEY, PROJECTILE_ARROW_KEY, ENTITY_PHOENIX_KEY, PROJECTILE_FIRE_KEY, STATIC_BG_DAY_KEY, STATIC_BG_NOON_KEY, STATIC_BG_NIGHT_KEY, STATIC_BG_DAWN_KEY, POOL_BG_ACTIVE_KEY, POOL_BG_FADE_KEY, ICON_ITEM_SHIELD_KEY, FILTER_DEATH_SPLIT, ICON_ITEM_WINGED_TREAD_KEY, ICON_ITEM_RAM_KEY } from "../constants/keys";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants/world";
import { EnemyEagle } from "../gameobjects/sprites/enemy-eagle";
import { SpriteCarpet } from "../gameobjects/sprites/sprite-carpet";
import type { Player } from "../gameobjects/sprites/player";
import { GameObject } from "../gameobjects/gameobject";
import { PoolManager } from "./pool-manager";
import { Sprite } from "../gameobjects/sprites/sprite";
import { ImageGround } from "../gameobjects/images/image-ground";
import { ImageLava } from "../gameobjects/images/image-lava";
import { ImageBackground } from "../gameobjects/images/image-background";
import { ItemArrows } from "../gameobjects/images/items/item-arrows";
import type { Item } from "../gameobjects/images/items/item";
import { PowerupManager } from "./powerup-manager";
import { ProjectileArrow } from "../gameobjects/projectiles/projectile-arrow";
import type { ProjectileAnimated } from "../gameobjects/projectiles/projectile-animated";
import { GameObjectState } from "../enums/gameobject-state";
import type { Layers } from "../main";
import { ScoreType } from "../enums/score-type";
import type { Enemy } from "../gameobjects/sprites/enemy";
import { ProjectileFire } from "../gameobjects/projectiles/projectile-fire";
import { EnemyPhoenix } from "../gameobjects/sprites/enemy-phoenix";
import { ItemShield } from "../gameobjects/images/items/item-shield";
import { ObjectType } from "../enums/object-type";
import { ItemWingedTread } from "../gameobjects/images/items/item-winged-tread";
import { ItemRam } from "../gameobjects/images/items/item-ram";

type Vector2 = {
    xStep: number,
    yStep: number
};

const SCREENS_FOR_POINTS = 2;
const SCREENS_FOR_DIFFICULTY = 12;
const SCREENS_FOR_BG_CYCLE = 14;
const SCREENS_DIFF_BG_FADE = 4;
const DIFFICULTY_FOR_ENEMY_PHOENIX = 2;
const DIFFICULTY_FOR_FIRE_SIZE = 4;
const BIAS_SPAWN_PHOENIX = 20;
const MIN_BG_FADE_SPEED = 4;
const MAX_BG_FADE_SPEED = 15;

const DEBUG = false;

interface LevelManagerApi {
    setFreezeGame: (freeze: boolean) => void;
    setPowerupOverlayCount: (count: number) => void;
    addDifficulty: () => number;
    addScore: (scoreType: ScoreType) => void;
    addFilter: (filterKey: string, gameObj: GameObject) => Phaser.Filters.Controller;
    removeFilter: (filterKey: string, gameObj: GameObject) => void;
    stopGame: () => void;
    getBoundLeft: () => number;
}

export class LevelManager {
    private api: LevelManagerApi;

    private scene: Phaser.Scene;
    private player: Player;
    private poolManager: PoolManager;
    private powerupManager: PowerupManager;

    private groupGround: Phaser.Physics.Arcade.Group;
    private groupLava: Phaser.Physics.Arcade.Group;
    private groupPlatforms: Phaser.Physics.Arcade.Group;
    private groupEnemies: Phaser.Physics.Arcade.Group;
    private groupItems: Phaser.Physics.Arcade.Group;
    private groupProjectilesAnim: Phaser.Physics.Arcade.Group;
    private groupProjectileFire: Phaser.Physics.Arcade.Group;

    private readonly groundWidth: number = SCREEN_WIDTH / 4;
    private readonly platformHeightLevel = 80;

    private nextSpawnX: number = -SCREEN_WIDTH;
    private lastOnScreenPlatformPos: Vector2 = {xStep: 0, yStep: 0};
    private lastLavaStepX: number = 0;
    private readonly platformWidth: number = 32 * 2;
    private readonly platformOnscreenCountMax: number = 4;
    private readonly platformCountMax: number = this.platformOnscreenCountMax * 2;
    private readonly platformMaxStepY = 2;
    private readonly platformMaxStepX = 3;

    private readonly entityOnscreenCountMax: number = 4;
    private readonly enemyHeightLevel: number = 48;
    private readonly enemyMaxStepY = 3;

    private readonly minScreensToItemSpawn = 4;
    private readonly maxScreensToItemSpawn = 12;
    private currentScreensToItemSpawn = 0;
    private currentBgIdx = 0;
    private bgFadeSpeedSeconds = 8;
    private gamePaused: boolean = false;

    private readonly bgKeys = [
        STATIC_BG_MORNING_KEY,
        STATIC_BG_DAY_KEY,
        STATIC_BG_NOON_KEY,
        STATIC_BG_NIGHT_KEY,
        STATIC_BG_DAWN_KEY,
    ];

    private currentDifficulty: number = 0;

    private itemKeys: string[] = [
        ICON_ITEM_ARROWS_KEY,
        ICON_ITEM_SHIELD_KEY,
        ICON_ITEM_WINGED_TREAD_KEY,
        ICON_ITEM_RAM_KEY
    ];

    constructor(scene: Phaser.Scene, player: Player, powerupManager: PowerupManager, api: LevelManagerApi) {
        this.api = api;
        this.scene = scene;
        this.player = player;
        this.powerupManager = powerupManager;

        this.player.initGameObject(new GameObject(this.player, 0));

        this.create();
        this.init();


        /*
        setTimeout(() => {
            this.powerupManager.onItemPickup(new ItemArrows(this.scene, this.powerupManager.powerupArrows));
        }, 3000)
        */
    }

    private create(): void {
        this.createPoolManager();
        this.createColliders();
    }

    private createPoolManager(): void {
        this.poolManager = new PoolManager();

        // Background
        this.poolManager.createPool(POOL_BG_ACTIVE_KEY, () => new ImageBackground(this.scene, STATIC_BG_MORNING_KEY));
        this.poolManager.createPool(POOL_BG_FADE_KEY, () => new ImageBackground(this.scene, STATIC_BG_DAY_KEY), 8);

        // Immoveable Collidables
        this.poolManager.createPool(STATIC_GROUND_KEY, () => new ImageGround(this.scene), 12);
        this.poolManager.createPool(STATIC_LAVA_KEY, () => new ImageLava(this.scene), 12);
        this.poolManager.createPool(STATIC_PLATFORM_KEY, () => new SpriteCarpet(this.scene), this.platformCountMax);

        // Enemies
        this.poolManager.createPool(ENTITY_EAGLE_KEY, () => new EnemyEagle(this.scene), 12);
        this.poolManager.createPool(ENTITY_PHOENIX_KEY, () => new EnemyPhoenix(
            this.scene,
            (x, y) => this.spawnProjectileFire(x, y),
            () => this.player.x
        ), 8);

        // Items
        this.poolManager.createSpecificPool(
            POOL_ITEMS_KEY,
            { index: this.itemKeys.indexOf(ICON_ITEM_ARROWS_KEY), factory: () => new ItemArrows(this.scene, this.powerupManager.powerupArrows) },
            { index: this.itemKeys.indexOf(ICON_ITEM_SHIELD_KEY), factory: () => new ItemShield(this.scene, this.powerupManager.powerupShield) },
            { index: this.itemKeys.indexOf(ICON_ITEM_WINGED_TREAD_KEY), factory: () => new ItemWingedTread(this.scene, this.powerupManager.powerupWingedTread) },
            { index: this.itemKeys.indexOf(ICON_ITEM_RAM_KEY), factory: () => new ItemRam(this.scene, this.powerupManager.powerupRam) },
        );

        // Projectiles
        this.poolManager.createPool(PROJECTILE_ARROW_KEY, () => new ProjectileArrow(this.scene, (arrow) => this.despawnObject(arrow)), 8);
        this.poolManager.createPool(PROJECTILE_FIRE_KEY, () => new ProjectileFire(this.scene), 8);
    }

    private createColliders(): void {
        // Ground
        this.groupGround = this.scene.physics.add.group({ allowGravity: false, immovable: true });
        this.poolManager.getObjects(STATIC_GROUND_KEY).forEach(ground => this.groupGround.add(ground.getObject()));
        this.scene.physics.add.collider(this.player, this.groupGround);

        // Lava
        this.groupLava = this.scene.physics.add.group({ allowGravity: false, immovable: true });
        this.poolManager.getObjects(STATIC_LAVA_KEY).forEach(groundLava => this.groupLava.add(groundLava.getObject()));
        this.scene.physics.add.collider(
            this.player,
            this.groupLava,
            (_, collided) => this.onPlayerHit((collided as ImageLava).getGameObject(), ObjectType.STATIC)
        );

        // Platforms
        this.groupPlatforms = this.scene.physics.add.group({ allowGravity: false, immovable: true });
        this.poolManager.getObjects(STATIC_PLATFORM_KEY).forEach(platform => this.groupPlatforms.add(platform.getObject()));
        this.scene.physics.add.collider(this.player, this.groupPlatforms);

        // Items
        this.groupItems = this.scene.physics.add.group({ allowGravity: false, immovable: true });
        this.poolManager.getObjects(POOL_ITEMS_KEY).forEach(item => this.groupItems.add(item.getObject()));
        this.scene.physics.add.overlap(
            this.player,
            this.groupItems,
            (_, item) => this.onItemPickup(item as Item)
        );   

        // Enemies
        this.groupEnemies = this.scene.physics.add.group({ allowGravity: false, immovable: true });
        this.poolManager.getObjects(ENTITY_EAGLE_KEY).forEach(eagle => this.groupEnemies.add(eagle.getObject()));
        this.poolManager.getObjects(ENTITY_PHOENIX_KEY).forEach(enemy => this.groupEnemies.add(enemy.getObject()));

        this.scene.physics.add.overlap(
            this.player,
            this.groupEnemies,
            (_, collided) => this.onPlayerHit((collided as Enemy).getGameObject(), ObjectType.ENEMY)
        );

        // Attack Animation
        this.scene.physics.add.overlap(
            this.player.getAnimSlash(),
            this.groupEnemies,
            (_, collided) => this.onEnemyHit((collided as Sprite).getGameObject()));

        // Animated Projectiles
        this.groupProjectilesAnim = this.scene.physics.add.group({ allowGravity: false, immovable: true });
        this.poolManager.getObjects(PROJECTILE_ARROW_KEY).forEach(projectile => this.groupProjectilesAnim.add(projectile.getObject()));

        this.scene.physics.add.overlap(
            this.player,
            this.groupProjectilesAnim,
            (_, projectile) => this.onProjectileAnimPlayerHit(projectile as ProjectileAnimated)
        );
        
        this.scene.physics.add.overlap(
            this.groupEnemies,
            this.groupProjectilesAnim,
            (enemy, projectile) => this.onProjectileAnimEnemyHit(projectile as ProjectileAnimated, (enemy as Sprite).getGameObject())
        );

        // Fire Projectiles
        this.groupProjectileFire = this.scene.physics.add.group({ allowGravity: false, immovable: false });
        this.poolManager.getObjects(PROJECTILE_FIRE_KEY).forEach(projectile => this.groupProjectileFire.add(projectile.getObject()));

        this.scene.physics.add.overlap(
            this.player,
            this.groupProjectileFire,
            (_, projectile) => {
                this.onProjectileHit((projectile as ProjectileFire).getGameObject());
                this.onPlayerHit((projectile as ProjectileFire).getGameObject(), ObjectType.PROJECTILE);
            }
        );

        this.scene.physics.add.overlap(
            this.groupGround,
            this.groupProjectileFire,
            (_, projectile) => this.onProjectileHit((projectile as ProjectileFire).getGameObject())
        );

        this.scene.physics.add.overlap(
            this.groupLava,
            this.groupProjectileFire,
            (_, projectile) => this.onProjectileHit((projectile as ProjectileFire).getGameObject())
        );

        this.scene.physics.add.overlap(
            this.player.getAnimSlash(),
            this.groupProjectileFire,
            (_, projectile) => {
                this.onProjectileHit((projectile as ProjectileFire).getGameObject());
                this.api.addScore(ScoreType.KILL_FIRE_PROJECTILE);
            }
        );
    }

    public assignLayers(layers: Layers): void {
        this.assignLayer(POOL_BG_ACTIVE_KEY,    layers.layerBack);
        this.assignLayer(POOL_BG_FADE_KEY,      layers.layerBack);


        for(let enemy of this.poolManager.getObjects(ENTITY_EAGLE_KEY)) {
            layers.layerMid.add(enemy.getObject());
        }

        for(let enemy of this.poolManager.getObjects(ENTITY_PHOENIX_KEY)) {
            layers.layerMid.add(enemy.getObject());
        }

        for(let item of this.poolManager.getObjects(POOL_ITEMS_KEY)) {
            layers.layerMid.add(item.getObject());
            layers.layerMid.add((item.getObject() as Item).getItemImage());
        }

        for(let arrow of this.poolManager.getObjects(PROJECTILE_ARROW_KEY)) {
            layers.layerTop.add(arrow.getObject());
        }

        for(let projectile of this.poolManager.getObjects(PROJECTILE_FIRE_KEY)) {
            layers.layerTop.add(projectile.getObject());
        }
    }

    private assignLayer(key: string, layer: Phaser.GameObjects.Layer) {
        for(const gameObj of this.poolManager.getObjects(key)) {
            layer.add(gameObj.getObject());
        }
    }

    private init(): void {
        this.scene.physics.world.setBounds(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        this.scene.cameras.main.setBounds(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        this.player.init({
            finishApi: {
                finishPowerup: (powerup) => this.powerupManager.onPowerupFinish(powerup),
            },
            systemApi: {
                addPlayerFilter: (filterKey) => this.api.addFilter(filterKey, this.player.getGameObject()),
                removePlayerFilter: (filterKey) => this.api.removeFilter(filterKey, this.player.getGameObject()),
                setOverlayCount: (count: number) => this.api.setPowerupOverlayCount(count),
                getTweens: () => this.scene.tweens
            },
            collisionApi: {
                damageHostile: (collision, collisionType) => {
                    switch(collisionType) {
                        case ObjectType.ENEMY:
                            this.onEnemyHit(collision);
                            break;
                        case ObjectType.PROJECTILE:
                            this.onProjectileHit(collision, true);
                            break;
                        default:
                            break;
                    }
                }
            },
            attackApi: {
                spawnProjectileAnim: (key, x, y) => this.spawnProjectileAnimated(key, x, y),
                createSpecialCooldown: (cooldownMs) => this.powerupManager.createPowerupCooldown(cooldownMs, this.scene.time),
                isSpecialOnCooldown: () => this.powerupManager.isPowerupOnCooldown()
            }
        });

        this.cleanup();

        this.spawnNextRandomBatch();
        this.spawnNextRandomBatch();
    }

    private checkForSpawnBatch(): void {
        const boundX = this.getBoundLeft();
        if(boundX >= this.nextSpawnX) {
            this.spawnNextRandomBatch();
        }
    }

    private checkForDespawn(): void {
        const boundX = this.getBoundLeft();

        const playerCenter = this.player.x;
        if(playerCenter < boundX) this.damagePlayer();

        this.poolManager.reserveActiveObjects((obj: GameObject) => {
            if(obj.getState() !== GameObjectState.ACTIVE) return;

            const topRight = obj.getObject().getTopRight();
            const endX = topRight.x;
            const endY = topRight.y;
            const leftX = (DEBUG) ? (endX - 20) : endX;
            return leftX <= boundX || endY < 0;
        });
    }

    private spawnNextBackground(): GameObject {
        const x = this.nextSpawnX + SCREEN_WIDTH * 1.5;
        const y = SCREEN_HEIGHT / 2;

        const bgKey = this.bgKeys[this.currentBgIdx];      
        const bg = this.spawnObject(POOL_BG_ACTIVE_KEY, x, y);
        if(bg === null) {
            console.error("Got null bg");
            return;
        }

        bg.getObject().setTexture(bgKey);

        // Mirror every second image for seamless transition.
        bg.getObject().setFlipX(
            (this.nextSpawnX % (SCREEN_WIDTH * 2) === 0)
        );

        return bg;
    }

    /**
     * Spawns many backgrounds of the next day-night cycle on top of the current backgrounds
     * and slowly fades them in, to create a smooth transition into the next day-night background.
     */
    private spawnFadingBackgrounds() {
        const bgKey = this.bgKeys[(this.currentBgIdx + 1) % this.bgKeys.length];
        const backgrounds: ImageBackground[] = [];

        const xBase = this.nextSpawnX;
        const y = SCREEN_HEIGHT / 2;

        for(let i = 0; i < 8; i++) {
            const xFactor = xBase + SCREEN_WIDTH * (-0.5 + i * 1.0);

            const bg = this.spawnObject(POOL_BG_FADE_KEY, xFactor, y).getObject() as ImageBackground;
            bg.setTexture(bgKey);

            bg.setFlipX(this.nextSpawnX % (SCREEN_WIDTH * 2) === 0 && i % 2 === 0);
            bg.setAlpha(0);
            bg.setDepth(1);

            backgrounds.push(bg);
        }

        this.scene.tweens.addCounter({
            duration: this.bgFadeSpeedSeconds * 1000,
            ease: "Linear",
            onUpdate: (tweens) => {
                for(const bg of backgrounds) {
                    bg.setAlpha(tweens.progress);
                }
            }
        });
    }

    private spawnNextPlatforms(): Vector2[] {
        function genConsecutiveYIncr(lastY: number): number {
            const yLevelWeight = Phaser.Math.RND.between(0, 100);

            if(lastY > 0) {
                if(yLevelWeight < 40) return 1;
                else if(yLevelWeight < 70) return 0;
                else if(yLevelWeight < 95) return -1;
                else return -2;
            } else {
                if(yLevelWeight < 90) return 1;
                else return 0;
            }
        }

        const platformSpawnCount = Phaser.Math.RND.between(0, this.platformOnscreenCountMax);
        if(platformSpawnCount <= 0) {
            this.lastOnScreenPlatformPos = { xStep: 0, yStep: 0};
            return [];
        }

        // Random x steps.
        let xSteps: number[] = Array.from({ length: this.platformMaxStepX + 1 }, (_, i) => i);

        if(platformSpawnCount < this.platformOnscreenCountMax) {
            // Spawning between 1 and 3 platforms.
            // Randomize the selected x-steps, then slice and sort the array again,
            //   to neatly iterate over it by the horizontal pos.
            xSteps = Phaser.Math.RND.shuffle(xSteps)
                .slice(0, platformSpawnCount)
                .sort();
        }

        // Biased-Random y steps.
        let lastPos: Vector2 = {
            xStep: this.lastOnScreenPlatformPos.xStep - (this.platformMaxStepX + 1),
            yStep: this.lastOnScreenPlatformPos.yStep
        };

        let platformPositions: Vector2[] = [];
        
        const distance = 1;
        for(let i = 0; i < xSteps.length; i++) {
            const currentX = xSteps[i];

            const diff = Math.abs(lastPos.xStep - currentX);
            let yStep: number;
            if(diff <= distance) {
                yStep = lastPos.yStep + genConsecutiveYIncr(lastPos.yStep);
                yStep = Math.max(yStep, 0);
                yStep = Math.min(yStep, this.platformMaxStepY)
            } else {
                yStep = 0;
            }

            lastPos = { xStep: currentX, yStep: yStep};
            platformPositions.push(lastPos);
        }

        this.lastOnScreenPlatformPos = { xStep: lastPos.xStep, yStep: lastPos.yStep };

        for(let pos of platformPositions) {
            const x = (this.nextSpawnX + SCREEN_WIDTH) + (SCREEN_WIDTH / (this.platformMaxStepX + 1)) * pos.xStep + this.platformWidth;
            const y = SCREEN_HEIGHT - (pos.yStep + 1) * this.platformHeightLevel;
            this.spawnObject(STATIC_PLATFORM_KEY, x, y);
        }

        return platformPositions;
    }

    private spawnNextEntities(platforms: Vector2[]): void {
        function genDefaultStepY(): number {
            return Phaser.Math.RND.between(0, 1);
        }

        const entitySpawnCountPicks = [2, 1, 3, 0, 4];
        const entitySpawnCount = Phaser.Math.RND.weightedPick(entitySpawnCountPicks);

        if(entitySpawnCount <= 0) {
            return;
        }

        let xSteps: number[] = Array.from({ length: this.entityOnscreenCountMax }, (_, i) => i);
        if(entitySpawnCount < this.entityOnscreenCountMax) {
            xSteps = Phaser.Math.RND.shuffle(xSteps)
                .slice(0, entitySpawnCount)
                .sort();
        }

        for(let i = 0; i < xSteps.length; i++) {
            let yStep: number;

            // Bias to spawn at platform.
            const platformBias = Phaser.Math.RND.between(0, 100);
            if(platformBias < 60) {
                let platformIndex = -1;
                for(let k = 0; k < platforms.length; k++) {
                    if(platforms[k].xStep === xSteps[i]) {
                        platformIndex = k;
                        break;
                    }
                }

                // Can spawn at a platform.
                if(platformIndex >= 0) {
                    const platformY = platforms[platformIndex].yStep;
                    // For the first platform y-step only, allow an enemy spawn below.
                    const minY = (platformY === 0)
                        ? 0
                        : platformY + 1;

                    const maxY = Math.min(platformY + 2, this.enemyMaxStepY);

                    yStep = Phaser.Math.RND.between(minY, maxY);
                } else {
                    yStep = genDefaultStepY();
                }
            } else {
                yStep = genDefaultStepY();
            }

            const x = (this.nextSpawnX + SCREEN_WIDTH) + (SCREEN_WIDTH / (this.entityOnscreenCountMax)) * xSteps[i] + this.platformWidth;
            const y = SCREEN_HEIGHT - (yStep * this.platformHeightLevel) - this.enemyHeightLevel;

            // Decide what entity to spawn here.
            let spawnItem = false;
            if(this.currentScreensToItemSpawn >= this.minScreensToItemSpawn) {
                if(this.currentScreensToItemSpawn >= this.maxScreensToItemSpawn) {
                    spawnItem = true;
                } else {
                    const itemBias = Phaser.Math.RND.between(0, 100);
                    if(itemBias < 5) spawnItem = true;
                }
            }

            if(spawnItem) {
                const randItemIndex = Phaser.Math.RND.between(0, this.itemKeys.length-1);
                this.spawnSpecificObject(POOL_ITEMS_KEY, randItemIndex, x, y);
                this.currentScreensToItemSpawn = 0;
                //this.spawnRandomItem(x, y);
            } else {
                const enemyTypeBias = Phaser.Math.RND.between(0, 100);
                let enemyKey: string;

                if(this.currentDifficulty >= DIFFICULTY_FOR_ENEMY_PHOENIX && enemyTypeBias < BIAS_SPAWN_PHOENIX) {
                    enemyKey = ENTITY_PHOENIX_KEY;
                } else {
                    enemyKey = ENTITY_EAGLE_KEY;
                }
                this.spawnObject(enemyKey, x, y);
            }
        }
    }

    private spawnNextGround(platforms: Vector2[]): void {
        function canGenLava(): boolean {
            const spawnLavaBias = Phaser.Math.RND.between(0, 100);
            if(spawnLavaBias < 30) {
                return true;
            }
            return false;
        }

        let groundCount = SCREEN_WIDTH / this.groundWidth;
        let startGroundPosX = this.nextSpawnX + SCREEN_WIDTH + this.groundWidth / 2;

        
        const xSteps = Array.from({ length: groundCount }, (_, i) => i).toSorted();

        for(let i = 0; i < xSteps.length; i++) {
            const xStep = xSteps[i];
            const x = startGroundPosX + this.groundWidth * xStep;
            let y = SCREEN_HEIGHT;

            let spawnLava: boolean = false;

            // Occasionally spawn lava pits below platforms.
            // Two consecutive pits not normally jumpable,
            //   so only allow two lava pits in a row, when there is a platform at lowest y-step.
            const platformIndex = platforms.findIndex(platform => platform.xStep === xStep);
            const prevPlatformIndex = platforms.findIndex(platform => platform.xStep === xStep - 1);
            const prevStepIsLava: boolean = 
                (i === 0 && this.lastLavaStepX === groundCount - 1) ||
                (i > 0 && this.lastLavaStepX === i - 1);
            
            if(this.nextSpawnX >= SCREEN_WIDTH) {
                if(platformIndex >= 0 && !prevStepIsLava) {
                    spawnLava = canGenLava();
                } else if(prevPlatformIndex >= 0 && platforms[prevPlatformIndex].yStep === 0) {
                    spawnLava = canGenLava();
                }
            }


            let spawnKey: string;
            if(spawnLava) {
                spawnKey = STATIC_LAVA_KEY;
                y += 8;
                this.lastLavaStepX = i;
            } else {
                spawnKey = STATIC_GROUND_KEY;
            }

            const ground = this.spawnObject(spawnKey, x, y);

            if(ground === null) {
                console.warn("Could not spawn ground");
                break;
            }
        }
    }

    private spawnNextRandomBatch(): void {
        this.spawnNextBackground();
        const platforms = this.spawnNextPlatforms();
        this.spawnNextGround(platforms);
        if(this.nextSpawnX >= 0) this.spawnNextEntities(platforms);

        this.nextSpawnX += SCREEN_WIDTH;
        this.currentScreensToItemSpawn++;

        // Everything interactable has been spawned. Now check for distance-based behaviour.
        const screenStep = this.nextSpawnX / SCREEN_WIDTH;

        if(this.nextSpawnX > 0) {
            if(screenStep % SCREENS_FOR_POINTS === 0) {
                this.api.addScore(ScoreType.DISTANCE);
            }

            if(screenStep % SCREENS_FOR_DIFFICULTY === 0) {
                this.increaseDifficulty();
            }

            // Either spawn fading backgrounds of the upcoming day-night cycle,
            // or advance cycle for following regular backgrounds.
            const bgStep = screenStep % SCREENS_FOR_BG_CYCLE;
            if(bgStep === (SCREENS_FOR_BG_CYCLE - SCREENS_DIFF_BG_FADE)) {
                this.spawnFadingBackgrounds();
            } else if(bgStep === 0) {
                this.currentBgIdx = (this.currentBgIdx + 1) % this.bgKeys.length;
            }
        }
    }

    private spawnSpecificObject(poolKey: string, specificIndex: number, x: number, y: number): GameObject | null {
        const obj = this.poolManager.reuseSpecificObject(poolKey, specificIndex, x, y);
        if(!obj) {
            console.warn(`Could not spawn specific object ${poolKey}-${specificIndex}: Pool is exhausted`);
            return obj;
        }

        obj.setState(GameObjectState.ACTIVE);
        return obj;
    }

    private spawnObject(key: string, x: number, y: number): GameObject | null {
        const obj = this.poolManager.reuseObject(key, x, y);
        if(!obj) {
            console.warn(`Could not spawn object ${key}: Pool is exhausted`);
            return obj;
        }

        obj.setState(GameObjectState.ACTIVE);
        return obj;
    }

    private spawnProjectileAnimated(projectileKey: string, x: number, y: number) {
        const projectile = this.spawnObject(projectileKey, x, y).getObject() as ProjectileAnimated;
        if(projectile) projectile.start(ObjectType.PLAYER);
    }

    private spawnProjectileFire(x: number, y: number) {
        const projectile = this.spawnObject(PROJECTILE_FIRE_KEY, x, y).getObject() as ProjectileFire;
        projectile.fireAt(x, y, this.player.x, this.player.y);
    }

    private despawnObject(object: GameObject): void {
        if(object.getState() === GameObjectState.DESPAWNED) {
            console.log(`GameObject already despawned ${object.getTextureKey()}-${object.getId()}`);
            return;
        }

        this.poolManager.reserveObject(object);
    }

    private increaseDifficulty() {
        this.currentDifficulty = this.api.addDifficulty();

        if(this.currentDifficulty === DIFFICULTY_FOR_FIRE_SIZE) {
            this.poolManager.getObjects(PROJECTILE_FIRE_KEY).forEach(obj => {
                (obj.getObject() as ProjectileFire).addDifficulty();
            })
        }
    }

    private onEnemyHit(obj: GameObject): void {
        if(!obj) {
            console.error("GameObject is null in LevelManager.onEnemyHit");
            return;
        }

        // Immediately disable further collision
        if(obj.getState() !== GameObjectState.ACTIVE) return;
        obj.setState(GameObjectState.DYING);

        const hide = false;
        obj.disableBody(hide);
        obj.pause();

        const scoreType = (obj.getObject() as Enemy).getScoreType();
        this.api.addScore(scoreType);

        const filter = this.api.addFilter(FILTER_DEATH_SPLIT, obj);

        this.scene.tweens.add({
            targets: filter,
            progress: 1,
            duration: 3000,
            ease: "Linear",
            onComplete: () => {
                this.api.removeFilter(FILTER_DEATH_SPLIT, obj);
                this.despawnObject(obj);
            }
        })
            
    }

    private onPlayerHit(collided: GameObject, type: ObjectType): void {
        const obj = this.player.getGameObject();
        if(!obj) {
            console.error("GameObject is null in LevelManager.onPlayerHit");
            return;
        }

        const isDamaged = this.player.onHurt(collided, type);
        if(!isDamaged) return;

        if(obj.getState() !== GameObjectState.ACTIVE) return;
        obj.setState(GameObjectState.DYING);

        this.damagePlayer();
    }

    private damagePlayer() {
        this.api.setFreezeGame(true);
        this.pause();

        const filter = this.api.addFilter(FILTER_DEATH_SPLIT, this.player.getGameObject());

        this.scene.tweens.add({
            targets: filter,
            progress: 1,
            duration: 3000,
            ease: "Linear",
            onComplete: () => {
                this.player.setVisible(false);
                this.api.removeFilter(FILTER_DEATH_SPLIT, this.player.getGameObject());
                this.api.stopGame();
            }
        })
    }

    private onProjectileAnimPlayerHit(projectile: ProjectileAnimated) {
        if(projectile.isOngoing()) return;

        const projectileOwner = projectile.getOwnerType();
        if(projectileOwner === null || projectileOwner === ObjectType.PLAYER) return;

        projectile.registerCollisionForFinish(ObjectType.PLAYER, () => this.damagePlayer());
    }

    private onProjectileAnimEnemyHit(projectile: ProjectileAnimated, enemy: GameObject) {
        if(projectile.isOngoing()) return;

        const projectileOwner = projectile.getOwnerType();
        if(projectileOwner === null || projectileOwner === ObjectType.ENEMY) return;

        projectile.registerCollisionForFinish(ObjectType.ENEMY, (obj) => this.onEnemyHit(obj), enemy);
    }

    private onProjectileHit(obj: GameObject, addKillPoints: boolean = false) {
        if(obj.getState() !== GameObjectState.ACTIVE) return;
        obj.setState(GameObjectState.DYING);

        if(addKillPoints) {
            this.api.addScore(ScoreType.KILL_FIRE_PROJECTILE);
        }

        this.despawnObject(obj);
    }

    private onItemPickup(item: Item) {
        this.powerupManager.onItemPickup(item);
        this.api.addScore(ScoreType.POWERUP);
        this.despawnObject(item.getGameObject());
    }

    public setBgFadeSpeed(seconds: number) {
        this.bgFadeSpeedSeconds = Phaser.Math.Clamp(seconds, MIN_BG_FADE_SPEED, MAX_BG_FADE_SPEED);
    }

    public pause() {
        this.gamePaused = true;
        this.poolManager.pauseAllObjects();
    }

    private getBoundLeft(): number {
        return this.api.getBoundLeft();
    }

    public cleanup() {
        this.poolManager.reserveAllObjects();
        this.poolManager.resetAllObjects();
        this.player.setPos(SCREEN_WIDTH/4, SCREEN_HEIGHT - this.player.height * 1.35);
        this.player.getGameObject().setState(GameObjectState.ACTIVE);
        this.nextSpawnX = -SCREEN_WIDTH;
        this.currentDifficulty = 0;
        this.currentScreensToItemSpawn = 0;
        this.lastLavaStepX = 0;
        this.lastOnScreenPlatformPos = { xStep: 0, yStep: 0};
        this.gamePaused = false;
    }

    public update(): void {
        if(this.gamePaused) return;
        this.checkForDespawn();
        this.checkForSpawnBatch();
    }

}