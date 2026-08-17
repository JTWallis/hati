import * as Phaser from "phaser";
import { FILTER_RAINBOW } from "../constants/keys";

const fragmentShaderRainbowShimmer = `
precision mediump float;

uniform sampler2D iChannel0;
uniform vec2 resolution;
uniform float time;
uniform float speed;
uniform float intensity;
uniform float bandDensity;

varying vec2 outTexCoord;
varying vec2 outFragCoord;

vec3 hsv2rgb (float h, float s, float v) {
    vec3 k = vec3(1.0, 2.0 / 3.0, 1.0 / 3.0);
    vec3 p = abs(fract(vec3(h) + k) * 6.0 - 3.0);
    return v * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), s);
}

void main () {
    vec4 texel = texture2D(iChannel0, outTexCoord);

    float band = (outFragCoord.x + outFragCoord.y) * bandDensity + time * speed;
    float hue = fract(band);
    vec3 rainbow = hsv2rgb(hue, 1.0, 1.0);

    float sparkle = 0.5 + 0.5 * sin(band * 12.0 + time * speed * 6.0);
    rainbow *= (0.75 + 0.25 * sparkle);

    vec3 blended = 1.0 - (1.0 - texel.rgb) * (1.0 - rainbow);
    vec3 finalColor = mix(texel.rgb, blended, intensity);

    gl_FragColor = vec4(finalColor * texel.a, texel.a);
}
`;

export class RainbowShimmerController extends Phaser.Filters.Controller {
    public speed: number;
    public intensity: number;
    public bandDensity: number;

    constructor (camera: Phaser.Cameras.Scene2D.Camera) {
        super(camera, FILTER_RAINBOW);

        this.speed = 1.2;
        this.intensity = 0.5;
        this.bandDensity = 1.5;
    }
}

export class FilterRainbowShimmer extends Phaser.Renderer.WebGL.RenderNodes.BaseFilterShader {
    constructor (manager: Phaser.Renderer.WebGL.RenderNodes.RenderNodeManager) {
        super(FILTER_RAINBOW, manager, undefined, fragmentShaderRainbowShimmer);
    }

    public override setupUniforms (controller: RainbowShimmerController, drawingContext: Phaser.Renderer.WebGL.DrawingContext) {
        const pm = this.programManager;

        pm.setUniform('resolution', [ drawingContext.width, drawingContext.height ]);
        pm.setUniform('time', performance.now() / 1000);
        pm.setUniform('speed', controller.speed);
        pm.setUniform('intensity', controller.intensity);
        pm.setUniform('bandDensity', controller.bandDensity);
        pm.setUniform('iChannel0', 0);
    }
}