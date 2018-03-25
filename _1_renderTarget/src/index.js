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

import loop from 'raf-loop';
import resize from 'brindille-resize';

import OBJLoader from 'three-obj-loader';
import average from 'analyser-frequency-average';

//import OrbitControls from './js/OrbitControls';
import { analyser, freq, bands } from './js/audioFreqs';

OBJLoader(THREE);

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

// render  invisible texture  (actually a render target that we pass to render to render into, & the object has a texture property to receive stuff)
const renderTarget = new WebGLRenderTarget(w, h, { format: THREE.RGBAFormat });
console.log(w, h);

/* Lights */
const frontLight = new PointLight(0xffffff, 1);
const backLight = new PointLight(0xffffff, 0.5);
scene.add(frontLight);
scene.add(backLight);
frontLight.position.x = 20;
backLight.position.x = -20;

const group = new Group();
scene.add(group);

/* Content of scene */
//model
var loader = new THREE.OBJLoader();
//load a resource
loader.load(
  '/src/objects/model.obj',
  // called when resource is loaded
  function(object) {
    const objs = [];

    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        objs.push(child);
      }
    });

    addObj(objs[0]);
  }
);

function addObj(mesh) {
  var xDistance = w;
  var yDistance = h;
  var zDistance = h;

  var xOffset = -w / 2;
  var yOffset = -h / 2;
  var zOffset = -h / 2;

  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: THREE.FlatShading,
    opacity: 5,
    shininess: 120,
    transparent: true
  });

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 3; j++) {
      for (var k = 0; k < 3; k++) {
        var mesh = new THREE.Mesh(mesh.geometry, material);
        mesh.scale.set(250, 250, 250);
        mesh.position.x = xDistance * (i / 3) + xOffset;
        mesh.position.y = yDistance * (j / 2) + yOffset;
        mesh.position.z = zDistance * (k / 2) + zOffset;
        group.add(mesh);
      }
    }
  }

  var cubeGeometry = new BoxGeometry(1, 1, 1);
  var cubeMaterial = new THREE.MeshBasicMaterial({
    map: renderTarget.texture,
    color: 0x00ff00
  });
  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.scale.multiplyScalar(200);
  scene.add(cube);
  console.log(cube);

  engine.start();
}

var cube;

// create & launch main loop
const engine = loop(render);

//  Manage Resize canvas
resize.addListener(onResize);
function onResize() {
  camera.aspect = resize.width / resize.height;
  camera.updateProjectionMatrix();
  renderer.setSize(resize.width, resize.height);
}

// Render loop
function render() {
  // get sound freqs
  const subAvg = average(analyser, freq, bands.sub.from, bands.sub.to);
  const lowAvg = average(analyser, freq, bands.low.from, bands.low.to);
  const midAvg = average(analyser, freq, bands.mid.from, bands.mid.to);
  const highAvg = average(analyser, freq, bands.high.from, bands.high.to);

  // cancel inception
  cube.visible = false;
  group.visible = true;
  renderer.render(scene, camera, renderTarget);

  // rerender
  cube.visible = true;
  group.visible = false;
  renderer.render(scene, camera);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.05;
}
