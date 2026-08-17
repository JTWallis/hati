import * as Phaser from "phaser";
import "./style.css";
import * as Keys from "./constants/keys";
import { Player } from "./gameobjects/sprites/player";
import { InputManager } from "./managers/input-manager";
import * as World from "./constants/world";
import { LevelManager } from "./managers/level-manager";
import { FilterDeathSplit } from "./filters/FilterDeathSplit";
import { CooldownOverlay } from "./gameobjects/overlays/cooldown-overlay";
import { PowerupManager } from "./managers/powerup-manager";
import { StartOverlay } from "./gameobjects/overlays/start-overlay";
import { CameraManager } from "./managers/camera-manager";
import { ScoreboardOverlay } from "./gameobjects/overlays/scoreboard-overlay";
import { HttpManager } from "./managers/http-manager";
import { OptionsOverlay } from "./gameobjects/overlays/options-overlay";
import { FpsOverlay } from "./gameobjects/overlays/fps-overlay";
import { ScoreOverlay } from "./gameobjects/overlays/score-overlay";
import { ScoreManager } from "./managers/score-manager";
import { FilterRainbowShimmer } from "./filters/FilterRainbowShimmer";
import { FilterEdgeOutline } from "./filters/FilterOutline";
import { FilterManager } from "./managers/filter-manager";
import { CooldownCountOverlay } from "./gameobjects/overlays/cooldown-count-overlay";

export interface Layers {
  layerBack: Phaser.GameObjects.Layer;
  layerMid: Phaser.GameObjects.Layer;
  layerTop: Phaser.GameObjects.Layer;
  layerOverlay: Phaser.GameObjects.Layer;
}

const MAX_DIFFICULTY = 6;

class Game extends Phaser.Scene {

    inputManager: InputManager;
    levelManager: LevelManager;
    private powerupManager: PowerupManager;
    private cameraManager: CameraManager;
    private httpManager: HttpManager;
    private scoreManager: ScoreManager;
    private filterManager: FilterManager;

    player: Player;
    isGrounded: boolean = false;
    isAnimLocked: boolean = false;
    private isGameRunning: boolean = false;
    private currentDifficulty: number = 0;


    ground: Phaser.Physics.Arcade.StaticGroup;

    private layers: Layers;

    private overlayStart: StartOverlay;
    private overlayScoreboard: ScoreboardOverlay;
    private overlayOptions: OptionsOverlay;
    private overlayFps: FpsOverlay;
    private overlayScore: ScoreOverlay;
    private overlayAttack: CooldownOverlay;
    private overlayPowerup: CooldownCountOverlay;


    cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    private showFps: boolean = true;


    constructor() {
        super("Game");
    }

    preload(): void {
        this.loadImage("logo", "/static/phaser3-logo.png");

        this.loadImage(Keys.STATIC_GROUND_KEY, Keys.STATIC_GROUND_DIR);
        this.loadImage(Keys.STATIC_LAVA_KEY, Keys.STATIC_LAVA_DIR);

        this.loadImage(Keys.ICON_ATTACK_CLAW_KEY, Keys.ICON_ATTACK_CLAW_DIR);
        this.loadImage(Keys.ICON_ITEM_ARROWS_KEY, Keys.ICON_ITEM_ARROWS_DIR);
        this.loadImage(Keys.ICON_ITEM_SHIELD_KEY, Keys.ICON_ITEM_SHIELD_DIR);
        this.loadImage(Keys.ICON_ITEM_WINGED_TREAD_KEY, Keys.ICON_ITEM_WINGED_TREAD_DIR);
        this.loadImage(Keys.ICON_ITEM_RAM_KEY, Keys.ICON_ITEM_RAM_DIR);
        this.loadImage(Keys.ICON_ITEM_CONTAINER_KEY, Keys.ICON_ITEM_CONTAINER_DIR);

        this.loadImage(Keys.OVERLAY_START_KEY, Keys.OVERLAY_START_DIR);
        this.loadImage(Keys.OVERLAY_LAYOUT_KEY, Keys.OVERLAY_LAYOUT_DIR);
        this.loadImage(Keys.OVERLAY_OPTIONS_KEY, Keys.OVERLAY_OPTIONS_DIR);
        this.loadImage(Keys.OVERLAY_SCOREBOARD_KEY, Keys.OVERLAY_SCOREBOARD_DIR);
        this.loadImage(Keys.OVERLAY_POWERUP_KEY, Keys.OVERLAY_POWERUP_DIR);

        this.loadImage(Keys.STATIC_BG_MORNING_KEY, Keys.STATIC_BG_MORNING_DIR);
        this.loadImage(Keys.STATIC_BG_DAY_KEY, Keys.STATIC_BG_DAY_DIR);
        this.loadImage(Keys.STATIC_BG_NOON_KEY, Keys.STATIC_BG_NOON_DIR);
        this.loadImage(Keys.STATIC_BG_NIGHT_KEY, Keys.STATIC_BG_NIGHT_DIR);
        this.loadImage(Keys.STATIC_BG_DAWN_KEY, Keys.STATIC_BG_DAWN_DIR);

        this.loadSpritesheet(Keys.STATIC_PLATFORM_KEY, Keys.STATIC_PLATFORM_DIR, 96, 32);

        this.loadSpritesheet(Keys.ENTITY_PLAYER_KEY, Keys.ENTITY_PLAYER_DIR, 32, 32);
        this.loadSpritesheet(Keys.ENTITY_EAGLE_KEY, Keys.ENTITY_EAGLE_DIR, 32, 32);
        this.loadSpritesheet(Keys.ENTITY_PHOENIX_KEY, Keys.ENTITY_PHOENIX_DIR, 32, 32);

        this.loadSpritesheet(Keys.ANIM_SLASH_KEY, Keys.ANIM_SLASH_DIR, 32, 32);

        this.loadSpritesheet(Keys.PROJECTILE_ARROW_KEY, Keys.PROJECTILE_ARROW_DIR, 32, 32);
        this.loadImage(Keys.PROJECTILE_FIRE_KEY, Keys.PROJECTILE_FIRE_DIR);

        this.loadHtml(Keys.HTML_SCOREBOARD_KEY, Keys.HTML_SCOREBOARD_DIR);
        this.loadHtml(Keys.HTML_OPTIONS_KEY, Keys.HTML_OPTIONS_DIR);
        this.loadHtml(Keys.HTML_FPS_KEY, Keys.HTML_FPS_DIR);
        this.loadHtml(Keys.HTML_SCORE_KEY, Keys.HTML_SCORE_DIR);
        this.loadHtml(Keys.HTML_COUNT_KEY, Keys.HTML_COUNT_DIR);
    }

    private loadImage(key: string, tex: string) {
        this.load.image(key, "assets" + tex);
    }

    private loadSpritesheet(key: string, tex: string, frameWidth: number, frameHeight: number) {
        this.load.spritesheet(
        key,
        "assets" + tex, 
        { frameWidth: frameWidth, frameHeight: frameHeight }
        );
    }

    private loadHtml(key: string, dir: string) {
        this.load.html(key, "assets" + dir);
    }

    create(): void {

        this.player = new Player(this);

        this.player.on("animationcomplete-jump", () => {
            this.isAnimLocked = false;
            console.log("AnimComplete");
        });


        // Managers

        this.httpManager = new HttpManager();
        this.filterManager = new FilterManager();

        this.powerupManager = new PowerupManager({
            onItemPickup: (item) => this.player.addPowerup(item.getPowerup()),
            setOverlayTexture: (texture: string) => this.overlayPowerup.setTexture(texture),
            setOverlayVisible: (visible: boolean) => this.overlayPowerup.setVisible(visible),
            startOverlayCooldown: (cooldownMs: number) => this.overlayPowerup.startCooldown(cooldownMs)
        });

        this.cameraManager = new CameraManager(
            this.cameras.main,
            () => this.player.x
        );

        this.levelManager = new LevelManager(
            this,
            this.player,
            this.powerupManager,
            {
                setFreezeGame: (freeze) => this.setFreezeGame(freeze),
                setPowerupOverlayCount: (count) => this.overlayPowerup.setCount(count),
                addDifficulty: () => this.setDifficulty(this.currentDifficulty + 1),
                addScore: (scoreType) => this.scoreManager.addScore(scoreType),
                addFilter: (filterKey, gameObj) => this.filterManager.addFilter(filterKey, gameObj),
                removeFilter: (filterKey, gameObj) => this.filterManager.removeFilter(filterKey, gameObj),
                stopGame: () => this.stopGame(),
                getBoundLeft: () => this.cameraManager.getBoundLeft()
            }
        );

        this.inputManager = new InputManager(this.input);
        this.inputManager.setCallbacks({
            inputRightCallback: () => {
                this.startGame();
            },
            inputLeftCallback: () => {
                this.startGame();
            },
            inputSlowWalkCallback: () => {},
            inputJumpCallback: () => {},
            inputAttackCallback: () => {},
            inputAttackSpecialCallback: () => {},
            noInputCallback: () => {}
        }); 

        this.scoreManager = new ScoreManager((added, total) => this.overlayScore.addScore(added, total));

        // Overlays

        this.overlayOptions = new OptionsOverlay(
            this, 
            (checked) => {
                this.showFps = checked;
                this.overlayFps.setTotalVisible(checked);
            },
            (seconds) => this.levelManager.setBgFadeSpeed(seconds)
        );

        this.overlayStart = new StartOverlay(this);
        this.overlayFps = new FpsOverlay(this);
        this.overlayScore = new ScoreOverlay(this);
        this.overlayAttack = new CooldownOverlay(this, 20, 20);
        this.overlayAttack.setTexture(Keys.ICON_ATTACK_CLAW_KEY);

        this.overlayScoreboard = new ScoreboardOverlay(
            this,
            (score) => this.httpManager.postScore(score),
            () => this.httpManager.fetchTopTen(),
            () => this.restartGame()
        );

        // FILTERS
        (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).renderNodes.addNodeConstructor(Keys.FILTER_DEATH_SPLIT, FilterDeathSplit);
        (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).renderNodes.addNodeConstructor(Keys.FILTER_RAINBOW, FilterRainbowShimmer);
        (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).renderNodes.addNodeConstructor(Keys.FILTER_OUTLINE, FilterEdgeOutline);


        // Pregame Setup

        this.overlayPowerup = new CooldownCountOverlay(this, 20, 60);

        this.overlayStart.setTotalVisible(true);
        this.overlayScoreboard.setTotalVisible(false);
        this.overlayPowerup.setTotalVisible(false);


        this.createLayers();
        this.anims.globalTimeScale = 0.5;

        // Does not prevent shift + rightclick on Firefox
            document.body.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });

        this.setFreezeGame(true);

        //this.physics.world.createDebugGraphic();
    }

    private createLayers() {
        this.layers = {
            layerBack: this.add.layer().setToBack(),
            layerMid: this.add.layer().setToTop(),
            layerTop: this.add.layer().setToTop(),
            layerOverlay: this.add.layer().setToTop()
        };
        
        this.layers.layerMid.add([ this.player, this.player.getAnimSlash() ]);

        this.layers.layerOverlay.add([
            this.overlayStart,
            this.overlayScoreboard,
            this.overlayOptions,
            this.overlayFps,
            this.overlayScore,
            this.overlayAttack,
            this.overlayPowerup
        ]);
        
        this.levelManager.assignLayers(this.layers);
    }

    private startGame() {
        this.inputManager.setCallbacks({
            noInputCallback: () => this.player.onIdle(),
            inputRightCallback: () => {
                this.player.onInputRight();
                if(!this.isGameRunning) this.startGame();
            },
            inputLeftCallback: () => {
                this.player.onInputLeft();
                if(!this.isGameRunning) this.startGame();
            },
            inputJumpCallback: () => this.player.onInputJump(),
            inputSlowWalkCallback: (inputDown) => this.player.onInputSlowWalk(inputDown),
            inputAttackCallback: (cooldownMs) => {
                this.player.onInputAttack();
                this.overlayAttack.startCooldown(cooldownMs);
            },
            inputAttackSpecialCallback: (buttonDown, x, y) => this.player.onInputAttackSpecial(buttonDown, x, y)
        });

        this.inputManager.setCooldownsActive(true);
        this.overlayStart.setTotalVisible(false);
        this.overlayOptions.setTotalVisible(false);
        this.overlayScoreboard.setTotalVisible(false);
        this.player.setVisible(true);
        this.isGameRunning = true;
        this.setFreezeGame(false);
    }

    private restartGame() {
        this.cameraManager.cleanup();
        this.filterManager.cleanup();
        this.levelManager.cleanup();
        this.scoreManager.reset();
        this.player.cleanup();
        this.overlayPowerup.setTotalVisible(false);
        this.overlayScore.setScore(0);
        this.setDifficulty(0);
        this.startGame();
    }

    private stopGame() {
        this.isGameRunning = false;

        this.inputManager.setCallbacks({
            noInputCallback: () => {},
            inputRightCallback: () => {},
            inputLeftCallback: () => {},
            inputJumpCallback: () => {},
            inputSlowWalkCallback: () => {},
            inputAttackCallback: () => {},
            inputAttackSpecialCallback: () => {}
        });

        const freeze = true;
        this.setFreezeGame(freeze);

        this.overlayOptions.setTotalVisible(true);
        this.overlayScoreboard.setTotalVisible(true);
        this.overlayScoreboard.setPlayerPoints(this.scoreManager.getPoints());
        this.overlayScoreboard.loadTopTen();
    }

    private setFreezeGame(freeze: boolean) {
        this.player.setFreeze(freeze);
        this.cameraManager.setFreeze(freeze);
        this.inputManager.setCooldownsActive(!freeze);

        if(freeze) this.physics.world.pause();
        else this.physics.world.resume();
    }

    private setDifficulty(difficulty: number): number {
        this.currentDifficulty = Phaser.Math.Clamp(difficulty, 0, MAX_DIFFICULTY);

        this.physics.world.timeScale = 1.0 - (0.05 * this.currentDifficulty);
        this.cameraManager.setDifficulty(this.currentDifficulty);
        return this.currentDifficulty;    
    }

    update(): void {
        this.inputManager.update();
        this.cameraManager.update();
        this.levelManager.update();
        this.player.update();

        if(this.showFps) this.overlayFps.setFps(Math.floor(this.game.loop.actualFps));
    }
}

let configObject: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: World.SCREEN_WIDTH,
    height: World.SCREEN_HEIGHT,
    parent: "app",
    antialias: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: World.GRAVITY_Y, x: 0 }
        }
    },
    dom: {
        createContainer: true
    },
    //seed: ["1722253793203"],
    scene: Game
};

new Phaser.Game(configObject);