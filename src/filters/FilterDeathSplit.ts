import * as Phaser from "phaser";
import { FILTER_DEATH_SPLIT } from "../constants/keys";

const fragmentShaderDeathSplit = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform float uProgress;
uniform float uDistance;
varying vec2 outTexCoord;

void main() {
    vec2 uv = outTexCoord;
    vec2 center = vec2(0.5);
    vec2 quadrant = sign(uv - center);

    float ease = uProgress * uProgress;
    vec2 offset = quadrant * ease * uDistance;
    vec2 sampleUV = uv - offset;

    bool outOfBounds = sampleUV.x < 0.0 || sampleUV.x > 1.0 ||
                        sampleUV.y < 0.0 || sampleUV.y > 1.0;
    bool crossedCenter = sign(sampleUV.x - center.x) != quadrant.x ||
                          sign(sampleUV.y - center.y) != quadrant.y;

    if (crossedCenter) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec4 color = texture2D(uMainSampler, sampleUV);
    color.a *= 1.0 - smoothstep(0.5, 1.0, uProgress);
    gl_FragColor = color;
}
`;

export class FilterDeathSplit extends Phaser.Renderer.WebGL.RenderNodes.BaseFilterShader {

    constructor(manager: Phaser.Renderer.WebGL.RenderNodes.RenderNodeManager) {
        super(FILTER_DEATH_SPLIT, manager, undefined, fragmentShaderDeathSplit);
    }

    override setupUniforms(controller: DeathSplitController, drawingContext: Phaser.Renderer.WebGL.DrawingContext): void {
        const pm = this.programManager;
        pm.setUniform("uMainSampler", 0);
        pm.setUniform("uProgress", controller.progress)
        pm.setUniform("uDistance", controller.distance);
    }

}

export class DeathSplitController extends Phaser.Filters.Controller {
    public progress: number;
    public distance: number;

    constructor(camera: Phaser.Cameras.Scene2D.Camera) {
        super(camera, FILTER_DEATH_SPLIT);
        this.progress = 0;
        this.distance = 10.0;
    }
}