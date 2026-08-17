import * as Phaser from "phaser";
import { FILTER_OUTLINE } from "../constants/keys";

// https://github.com/phaserjs/phaser/blob/v4.1.0/src/renderer/webgl/shaders/src/FilterGlow.frag
const fragmentShaderEdgeOutline = `
precision mediump float;

uniform sampler2D iChannel0;
uniform vec2 resolution;
uniform float thickness;
uniform vec4 outlineColor;
uniform float alphaThreshold;

varying vec2 outTexCoord;

const int ANGLE_SAMPLES = 4;
const int RADIUS_STEPS = 1;
const float PI2 = 6.28318530718;

vec4 boundedSample (vec2 uv) {
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        return vec4(0.0);
    }

    return texture2D(iChannel0, uv);
}

void main () {
    vec4 texel = boundedSample(outTexCoord);

    if (texel.a >= alphaThreshold) {
        gl_FragColor = texel;
        return;
    }

    vec2 texelSize = thickness / resolution;
    float maxAlpha = 0.0;

    for (int a = 0; a < ANGLE_SAMPLES; a++) {
        float angle = (float(a) / float(ANGLE_SAMPLES)) * PI2;
        vec2 offset = vec2(cos(angle), sin(angle)) * texelSize;

        float sampleAlpha = boundedSample(outTexCoord + offset).a;
        maxAlpha = max(maxAlpha, sampleAlpha);
    }

    if (maxAlpha >= alphaThreshold) {
        gl_FragColor = vec4(outlineColor.rgb * outlineColor.a, outlineColor.a * maxAlpha);
    } else {
        gl_FragColor = vec4(0.0);
    }
}
`;

export class EdgeOutlineController extends Phaser.Filters.Controller {
    public color: number[];
    public colorRgba: Phaser.Math.Vector4;
    public alphaThreshold: number;
    public thickness: number;
    private paddingPx: number | undefined;

    constructor (camera: Phaser.Cameras.Scene2D.Camera) {
        super(camera, FILTER_OUTLINE);

        this.color = [ 1.0, 0.6, 0.2, 1.0 ];
        this.colorRgba = new Phaser.Math.Vector4(1.0, 0.6, 0.2, 1.0);
        this.alphaThreshold = 0.1;
        this.thickness = 1;

        this.applyPadding();
    }

    public getPaddingPx () {
        return (this.paddingPx === null) ? Math.ceil(this.thickness) : this.paddingPx;
    }

    public setPaddingPx (value: number) {
        this.paddingPx = value;
        this.applyPadding();
    }

    applyPadding () {
        const p = this.paddingPx;
        this.setPaddingOverride(p, p, p, p);
    }
}

export class FilterEdgeOutline extends Phaser.Renderer.WebGL.RenderNodes.BaseFilterShader {
    constructor (manager: Phaser.Renderer.WebGL.RenderNodes.RenderNodeManager) {
        super(FILTER_OUTLINE, manager, undefined, fragmentShaderEdgeOutline);
    }

    setupUniforms (controller: EdgeOutlineController, drawingContext: Phaser.Renderer.WebGL.DrawingContext) {
        const programManager = this.programManager;

        programManager.setUniform('resolution', [ drawingContext.width, drawingContext.height ]);
        programManager.setUniform('thickness', controller.thickness);
        programManager.setUniform('outlineColor', controller.color);
        programManager.setUniform('alphaThreshold', controller.alphaThreshold);
        programManager.setUniform('iChannel0', 0);
    }
}