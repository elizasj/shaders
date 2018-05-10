// what it looks like
varying vec2 vUv;

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture; // grab the three.js texture (w the pebbles .. but could be any three.js texture )
uniform vec4 frequencies;

float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    
    float res = mix(
        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
}

void main() {
    gl_FragColor = vec4(vUv.x,vUv.y,0.971,1.000);
    gl_FragColor = vec4(vUv.x,vUv.y, noise(vUv * 10. + time * 0.1) ,1.000);

    vec2 uv = vUv;

    float nx = (noise(uv * 10. + time * 0.1) - 0.5) * 0.1;
    uv.x += nx;

    float ny = (noise(uv * 3. + time * 0.2) - 0.5) * 0.1;
    uv.y += ny;

    gl_FragColor = texture2D(texture, uv);
    gl_FragColor += vec4( vec3( noise(uv * 10. + time * 0.1) ), 1. );
    
    vec4 yellow = vec4(1., .8, 0., 1.);
    vec4 blue = vec4(0., .6, 1., 1.);

    float a = gl_FragColor.r;

    a = smoothstep( .25, .35, a * frequencies.x);
    gl_FragColor = mix(yellow, blue, a);


    gl_FragColor = min( gl_FragColor, texture2D(texture, vUv) );
}