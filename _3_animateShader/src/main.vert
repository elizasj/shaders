 // where it's positioned
varying vec2 vUv; // bridge between 
void main() {
    vUv = uv; 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}