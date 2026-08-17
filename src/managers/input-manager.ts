
import * as Phaser from "phaser";

const COOLDOWN_ATTACK_MS = 2000;
const COOLDOWN_ATTACK_SPECIAL_MS = 50;

export type InputCallbacks = {
    noInputCallback:            () => void;
    inputRightCallback:         () => void;
    inputLeftCallback:          () => void;
    inputJumpCallback:          () => void;
    inputSlowWalkCallback:      (inputDown: boolean) => void;
    inputAttackCallback:        (cooldownMs: number) => void;
    inputAttackSpecialCallback: (buttonDown: boolean, x: number, y: number) => void;
}

export class InputManager {
    private clock: Phaser.Time.Clock;
    private callbacks: InputCallbacks;

    private inputRight: Phaser.Input.Keyboard.Key[] = [];
    private inputLeft: Phaser.Input.Keyboard.Key[] = [];
    private inputJump: Phaser.Input.Keyboard.Key[] = [];
    private inputSlowWalk: Phaser.Input.Keyboard.Key[] = [];
    private inputAttack: Phaser.Input.Keyboard.Key[] = [];

    private cooldownsActive: boolean = false;
    private isAttackCooldown: boolean = false;
    private isAttackSpecialCooldown: boolean = false;

    constructor(sceneInput: Phaser.Input.InputPlugin) {
        this.clock = sceneInput.scene.time;

        this.registerInputs(sceneInput);

    }

    public setCallbacks(inputCallbacks: InputCallbacks) {
        this.callbacks = inputCallbacks;
    }

    public setCooldownsActive(cooldownsActive: boolean) {
        this.cooldownsActive = cooldownsActive;
    }

    /**
     * Parses inputs and issues their callback.
     */
    public update(): void {
        this.callbacks.inputSlowWalkCallback(this.isInputSlowWalk());

        if(this.isInputJump()) {
            this.callbacks.inputJumpCallback();
        } else if(this.isInputAttack()) {
            this.onInputAttack();
        }

        if(this.isInputRight()) {
            this.callbacks.inputRightCallback();
        }
        else if(this.isInputLeft()) {
            this.callbacks.inputLeftCallback();
        }
        else {
            this.callbacks.noInputCallback();
        }
    }

    private registerInputs(sceneInput: Phaser.Input.InputPlugin): void {

        this.registerKeys(sceneInput, this.inputRight, [
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
            Phaser.Input.Keyboard.KeyCodes.D
        ]);

        this.registerKeys(sceneInput, this.inputLeft, [
            Phaser.Input.Keyboard.KeyCodes.LEFT,
            Phaser.Input.Keyboard.KeyCodes.A
        ]);

        this.registerKeys(sceneInput, this.inputJump, [
            Phaser.Input.Keyboard.KeyCodes.SPACE
        ]);

        this.registerKeys(sceneInput, this.inputSlowWalk, [
            Phaser.Input.Keyboard.KeyCodes.SHIFT
        ]);

        this.registerKeys(sceneInput, this.inputAttack, [
            Phaser.Input.Keyboard.KeyCodes.Q
        ]);

        
        sceneInput.on("pointerdown", (e: Phaser.Input.Pointer) => {
            if(e.rightButtonDown()) {
                this.onInputAttack();
            } else if(e.leftButtonDown()) {
                if(!this.isAttackSpecialCooldown) {
                    this.callbacks.inputAttackSpecialCallback(true, e.worldX, e.worldY);
                    this.startCooldownAttackSpecial();
                }
            }
        })

        sceneInput.on("pointermove", (e: Phaser.Input.Pointer) => {
            if(e.leftButtonDown() && !this.isAttackSpecialCooldown) {
                this.callbacks.inputAttackSpecialCallback(true, e.worldX, e.worldY);
                this.startCooldownAttackSpecial();
            }
        })

        sceneInput.on("pointerup", (e: Phaser.Input.Pointer) => {
            if(e.leftButtonReleased()) {
                this.callbacks.inputAttackSpecialCallback(false, e.worldX, e.worldY);
            }
        })
            
    }

    private registerKeys(sceneInput: Phaser.Input.InputPlugin, input: Phaser.Input.Keyboard.Key[], keyCodes: number[]) {
        keyCodes.forEach((key) => {
            input.push(sceneInput.keyboard.addKey(key, false));
        });
    }

    private isInputRight(): boolean {
        return this.isInput(this.inputRight);
    }

    private isInputLeft(): boolean {
        return this.isInput(this.inputLeft);
    }

    private isInputJump(): boolean {
        return this.isInput(this.inputJump);
    }

    private isInputSlowWalk(): boolean {
        return this.isInput(this.inputSlowWalk);
    }

    private isInputAttack(): boolean {
        return this.isInput(this.inputAttack);
    }

    private isInput(input: Phaser.Input.Keyboard.Key[]): boolean {
        for(let i = 0; i < input.length; i++) {
            if(input[i].isDown) {
                return true;
            }
        }

        return false;
    }

    private onInputAttack() {
        if(this.isAttackCooldown) return;
        this.startCooldownAttack();
        this.callbacks.inputAttackCallback(COOLDOWN_ATTACK_MS);
    }

    private startCooldownAttack(): void {
        if(!this.cooldownsActive) return;
        this.isAttackCooldown = true;
        this.clock.delayedCall(COOLDOWN_ATTACK_MS, () => this.isAttackCooldown = false);
    }

    private startCooldownAttackSpecial(): void {
        if(!this.cooldownsActive) return;
        this.isAttackSpecialCooldown = true;
        this.clock.delayedCall(COOLDOWN_ATTACK_SPECIAL_MS, () => this.isAttackSpecialCooldown = false);
    }

}