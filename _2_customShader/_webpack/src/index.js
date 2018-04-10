import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  PointLight,
  WebGLRenderTarget,
  BoxGeometry,
  MeshBasicMaterial,
  Group
} from 'three';
import * as THREE from 'three';
import OBJLoader from 'three-obj-loader';

import loop from 'raf-loop';
import resize from 'brindille-resize';

OBJLoader(THREE);

import FragmentShader from './main.frag';
import VertexShader from './main.vert';

/************************* **********************/

/* Init renderer and canvas */
const container = document.body;
const renderer = new WebGLRenderer({ antialias: true });
renderer.setClearColor(0x323232);
container.style.overflow = 'hidden';
container.style.margin = 0;
container.appendChild(renderer.domElement);

/* Main scene and camera */
const scene = new Scene();
const w = resize.width;
const h = resize.height;
const camera = new OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 1000);

camera.position.set(0, 0, 150);

var cubeGeometry = new THREE.PlaneGeometry(1, 1);
var cubeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    resolution: { value: new THREE.Vector2() }
  },
  fragmentShader: FragmentShader,
  vertexShader: VertexShader
});
var cube;
cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// x, y, z <--- if u put 0 instead of 1 it will explode
cube.scale.set(w, h, 1);
scene.add(cube);
console.log(cube);

// create & launch main loop
const engine = loop(render);
engine.start();

//  Manage Resize canvas
resize.addListener(onResize);

function onResize() {
  camera.aspect = resize.width / resize.height;
  camera.updateProjectionMatrix();
  renderer.setSize(resize.width, resize.height);
}

// Render loop
function render() {
  // rerender
  renderer.render(scene, camera);
}
