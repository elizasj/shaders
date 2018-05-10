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

import average from 'analyser-frequency-average';
import { analyser, freq, bands } from './js/audioFreqs';

import FragmentShader from './main.frag';
import VertexShader from './main.vert';

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

// render invisible texture (actually a render target that we pass to render() in order to render into it, & the object has a texture property to receive stuff (in this case the pebbles objs...)
const renderTarget = new WebGLRenderTarget(w, h, { format: THREE.RGBAFormat });
console.log(w, h);

/* Lights */
const frontLight = new PointLight(0xffffff, 1);
const backLight = new PointLight(0xffffff, 0.5);
scene.add(frontLight);
scene.add(backLight);
frontLight.position.x = 20;
backLight.position.x = -20;

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

const group = new Group();
scene.add(group);

function addObj(mesh) {
  var xDistance = w;
  var yDistance = h;
  var zDistance = h;

  var xOffset = -w / 2; //initial offset so does not start in middle
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

  var cubeGeometry = new THREE.PlaneGeometry(1, 1);
  cubeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 1.0 },
      resolution: {
        value: new THREE.Vector2(w, h)
      },
      texture: { value: renderTarget.texture },
      frequencies: { value: new THREE.Vector4() }
    },

    fragmentShader: FragmentShader,
    vertexShader: VertexShader
  });

  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  // x, y, z <--- if u put 0 instead of 1 it will explode
  cube.scale.set(w, h, 1);
  scene.add(cube);
  console.log(cube);

  engine.start();
}

var cube;
var cubeMaterial;

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

  group.traverse(function(o) {
    o.rotation.y += 0.01;
  });

  // cancel inception
  cube.visible = false;
  group.visible = true;
  renderer.render(scene, camera, renderTarget);

  // rerender
  cube.visible = true;
  group.visible = false;
  cubeMaterial.uniforms.time.value += 0.1; // maj of cpu var on gpu var
  cubeMaterial.uniforms.frequencies.value.set(subAvg, lowAvg, midAvg, highAvg);
  cubeMaterial.uniforms.frequencies.needsUpdate = true;
  renderer.render(scene, camera);
}
