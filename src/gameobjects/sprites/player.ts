import { Sprite } from "./sprite";
import { ENTITY_PLAYER_KEY } from "../../constants/keys";
import { AnimSlash } from "./anim-slash";
import type { Powerup } from "../../powerups/powerup";
import type { GameObject } from "../gameobject";
import type { ObjectType } from "../../enums/object-type";
import type { PowerupAttackApi, PowerupCollisionApi, PowerupFinishApi, PowerupPlayerApi, PowerupSystemApi } from "../../powerups/powerup-api";
import { GRAVITY_Y } from "../../constants/world";

const SPEED_DASH = 400;
const SPEED_RUN = 200;
const SPEED_WALK = 100;
const SPEED_JUMP = 400;

const ANIM_IDLE = "idle";
const ANIM_REST = "rest";
const ANIM_WALK = "walk";
const ANIM_RUN  = "run";
const ANIM_JUMP = "jump";

interface PowerupApiOutsideBundle {
    finishApi:      PowerupFinishApi;
    systemApi:      PowerupSystemApi;
    collisionApi:   PowerupCollisionApi;
    attackApi:      PowerupAttackApi;
}

interface PowerupApiBundle extends PowerupApiOutsideBundle {
    moveApi:        PowerupPlayerApi;
}

export class Player extends Sprite {
    private isSlowWalking: boolean = false;
    private isJumping: boolean = true;
    private isAttacking: boolean = false;
    private isRamming: boolean = false;
    private isFreezed: boolean = false;

    private animSlash: AnimSlash;
    private dashTimer: Phaser.Time.TimerEvent | null;

    private activePowerup: Powerup | null = null;
    private passivePowerups: Powerup[] = [];
    private powerupApi: PowerupApiBundle;

    constructor(scene: Phaser.Scene) {
        super(scene, ENTITY_PLAYER_KEY);
        this.createAnimations();

        this.animSlash = new AnimSlash(scene, () => this.onAttackComplete());
        this.animSlash.active = false;
        this.animSlash.body.enable = false;

        this.body.setSize(22, 10);
        this.body.setOffset(5, 19);

        this.setBounce(0.1);
        //this.setCollideWorldBounds(true, 2);

        this.anims.play(ANIM_REST, true);
    }

    public init(powerupApi: PowerupApiOutsideBundle) {
        this.powerupApi = {
            ...powerupApi,
            moveApi: {
                setFlipX: (value) => this.setFlipX(value),
                setVelocityX: (x) => this.setVelocityX(x),
                setRamming: (isRamming) => this.setRamming(isRamming),
                dash: (durationMs, playRunAnim, postRamMs?) => this.dash(durationMs, playRunAnim, postRamMs)
            },
            finishApi: {
                ...powerupApi.finishApi,
                finishPowerup:  (powerup) => {
                    this.onPowerupFinish(powerup);
                    powerupApi.finishApi.finishPowerup(powerup);
                }
            },
        };
    }

    public addPowerup(powerup: Powerup) {
        let isNewPowerup: boolean;
        let affectedPowerup: Powerup = null;

        if(powerup.isPassivePowerup) {
            for(const p of this.passivePowerups) {
                if(p === powerup) {
                    isNewPowerup = false;
                    affectedPowerup = p;
                    break;
                }
            }

            if(affectedPowerup === null) {
                isNewPowerup = true;
                this.passivePowerups.push(powerup);
                affectedPowerup = powerup;
            }
        } else {
            isNewPowerup = this.activePowerup === null || this.activePowerup !== powerup;
            this.activePowerup = powerup;
            affectedPowerup = powerup;
        }

        if(isNewPowerup) {
            if(affectedPowerup.usesStart) {
                affectedPowerup.onStart({
                    api: {
                        ...this.powerupApi.systemApi,
                        ...this.powerupApi.moveApi,
                        ...this.powerupApi.finishApi
                    }
                });
            }
        } else if(affectedPowerup.usesRefresh) {
            affectedPowerup.onRefresh({
                api: {
                    ...this.powerupApi.systemApi,
                    ...this.powerupApi.moveApi,
                    ...this.powerupApi.finishApi
                }
            });
        }
    }

    public onPowerupFinish(powerup: Powerup) {
        if(!powerup.isPassivePowerup) {
            if(powerup !== this.activePowerup) {
                console.warn("Finished powerup was not set as active powerup!");
                return;
            }
            this.activePowerup = null;
            return;
        }

        for(let i = 0; i < this.passivePowerups.length; i++) {
            const p = this.passivePowerups[i];
            if(p === powerup) {
                this.passivePowerups.splice(i, 1);
                return;
            }
        }

        console.warn("No powerup found to remove!");
    }

    public onInputRight(): void {
        if(this.isFreezed) return;
        this.setFlipX(false);
        this.animSlash.setFlipX(false);

        if(this.body.touching.down) {
            this.playAnimMove();
        }

        this.setVelocityX( (this.isSlowWalking) ? SPEED_WALK : SPEED_RUN );

        if(this.activePowerup !== null && this.activePowerup.usesInputMove) {
            this.activePowerup.onInputMove({
                isMovingRight: true,
                isSlowWalking: this.isSlowWalking,
                speedRun: SPEED_RUN,
                speedWalk: SPEED_WALK,
                api: {
                    ...this.powerupApi.moveApi,
                    ...this.powerupApi.finishApi
                }
            });
        }  
    }

    public onInputLeft(): void {
        if(this.isFreezed) return;
        this.setFlipX(true);
        this.animSlash.setFlipX(true);

        if(this.body.touching.down) {
            this.playAnimMove();
        }

        this.setVelocityX( -((this.isSlowWalking) ? SPEED_WALK : SPEED_RUN ));
    }

    public onInputJump(): void {
        if(this.isFreezed) return;
        if(this.body.touching.down) {
            this.isJumping = true;
            this.anims.play(ANIM_JUMP, true);
            this.setVelocityY(-SPEED_JUMP);
        }
    }

    public onInputSlowWalk(inputDown: boolean): void {
        this.isSlowWalking = inputDown;
    }

    public onInputAttack(): void {
        if(this.isFreezed) return;
        this.animSlash.active = true;
        this.animSlash.body.enable = true;

        this.animSlash.activate();
        this.isAttacking = true;
    }

    public onInputAttackSpecial(pointerDown: boolean, pointerX: number, pointerY: number): void {
        if(this.activePowerup !== null && this.activePowerup.usesInputAttackSpecial) {
            this.activePowerup.onInputAttackSpecial({
                pointerDown,
                pointerX,
                pointerY,
                isRamming: this.isRamming,
                api: {
                    ...this.powerupApi.systemApi,
                    ...this.powerupApi.attackApi,
                    ...this.powerupApi.moveApi,
                    ...this.powerupApi.finishApi
                }
            });
        }
    }

    public onIdle(): void {
        if(!this.body.touching.down) return;

        this.anims.play(ANIM_IDLE, true);
        this.setVelocityX(0);
    }

    public onHurt(collided: GameObject, collidedType: ObjectType): boolean {
        const powerups = (this.activePowerup)
            ? [this.activePowerup, ...this.passivePowerups]
            : this.passivePowerups;

        let isDamaged = !this.isRamming;

        for(const p of powerups) {
            if(p.usesPlayerDamaged) {
                const damaged = p.onPlayerDamaged({
                    collided: collided,
                    collidedType: collidedType,
                    isRamming: this.isRamming,
                    api: {
                        ...this.powerupApi.collisionApi,
                        ...this.powerupApi.systemApi,
                        ...this.powerupApi.finishApi
                    }
                });
                if(isDamaged) isDamaged = damaged;
            }
        }

        return isDamaged;
    }

    private onAttackComplete(): void {
        this.animSlash.active = false;
        this.animSlash.body.enable = false;
        this.isAttacking = false;
    }

    private dash(durationMs: number, playRunAnim: boolean, postRamMs?: number) {
        const gravityY = this.body.gravity.y;
        this.isRamming = true;
        this.setFreeze(true);
        this.setGravityY(-GRAVITY_Y);
        this.setFlipX(false);
        this.setVelocityY(0);
        this.setVelocityX(SPEED_DASH);


        this.anims.play({
            key: (playRunAnim) ? ANIM_RUN : ANIM_JUMP,
            repeat: -1,
        }, false);

        if(this.dashTimer) {
            this.dashTimer.remove();
        }

        this.dashTimer = this.scene.time.delayedCall(durationMs, () => {
            this.setFreeze(false);
            this.setGravityY(gravityY);
            this.setVelocityX(SPEED_RUN);
            this.dashTimer = null;

            if(postRamMs && postRamMs > 0) {
                this.dashTimer = this.scene.time.delayedCall(postRamMs, () => {
                    this.isRamming = false;
                    this.dashTimer = null;
                });
            } else {
                this.isRamming = false;
            }
        }
        );
    }

    private playAnimMove(): void {
        const animKey = (this.isSlowWalking) ? ANIM_WALK : ANIM_RUN;
        this.anims.play(animKey, true);
    }

    private createAnimations(): void {
        this.anims.create({
            key: ANIM_IDLE,
            frames: this.anims.generateFrameNumbers(this.texture.key, { start: 1, end: 1 }),
        });

        this.anims.create({
            key: ANIM_REST,
            frames: this.anims.generateFrameNumbers(this.texture.key, { start: 3, end: 3 }),
        });

        this.anims.create({
            key: ANIM_WALK,
            frames: this.anims.generateFrameNumbers(this.texture.key, 
                { 
                frames: [ 0, 1, 2, 1 ]
                }),
                repeat: 0
        });

        this.anims.create({
            key: ANIM_RUN,
            frames: this.anims.generateFrameNumbers(this.texture.key,
                { 
                frames: [ 5, 4, 6, ]
                }),
        });

        this.anims.create({
            key: ANIM_JUMP,
            frames: this.anims.generateFrameNumbers(this.texture.key,
                { 
                frames: [ 5, 4, 6, ]
                }),
                repeat: 0
        });
    }

    public setFreeze(isFreezed: boolean) {
        this.isFreezed = isFreezed;
    }

    public getAnimSlash(): Sprite {
        return this.animSlash;
    }

    private setRamming(isRamming: boolean) {
        this.isRamming = isRamming;
    }

    public cleanup() {
        this.activePowerup = null;
        this.passivePowerups.length = 0;
        
        if(this.dashTimer) {
            this.dashTimer.remove();
            this.dashTimer = null;
        }

        this.setVelocity(0, 0);
        this.setFlipX(false);
    }

    public update(): void {
        if(this.isJumping && this.body.touching.down) {
            this.isJumping = false;
        }

        if(this.isAttacking) {
            const x = this.x + this.width * (this.flipX ? -1 : 1);
            const y = this.y + this.height / 2;
            this.animSlash.setPosition(x, y);
        }
    }
}