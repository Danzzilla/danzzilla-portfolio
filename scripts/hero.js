import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
let camera;
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 2;

let object;
let controls;

const loader = new GLTFLoader();
loader.load(
  `../models/garage/1.gltf`,
  function(gltf){
      object = gltf.scene;
      camera = gltf.cameras[0];
      object.scale.setScalar(50);
      scene.add(object);
  },
    function(xhr){
      console.log((xhr.loaded / (xhr.total * 100)) + "% Loaded");
    },
    function(error){
      console.error(error);
    }
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("canvas").appendChild(renderer.domElement);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

window.addEventListener("resize", function(){
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
   renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();