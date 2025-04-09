import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

let model;
let controls;

new RGBELoader().load(
    "../models/garage/symmetrical_garden_02_2k.hdr",
    function(texture){
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;

        animate();

        new GLTFLoader().load(
            `../models/garage/1.gltf`,
            async function(gltf){
                model = gltf.scene;
                camera = gltf.cameras[0];

                await renderer.compileAsync(model, camera, scene);
                scene.add(model);

                animate();
            },
            function(xhr){
                console.log((xhr.loaded / (xhr.total * 100)) + "% Loaded");
            },
            function(error){
                console.error(error);
            }
        );
    }
);

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.getElementById("canvas").appendChild(renderer.domElement);

const sun = new THREE.DirectionalLight(0xfff2e5, 1);
sun.position.set(10, 10, 10)
sun.castShadow = true;
scene.add(sun);

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