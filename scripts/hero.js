import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.shadowMap.enabled = true;
document.getElementById("canvas").appendChild(renderer.domElement);

new RGBELoader().load(
    "../models/garage/symmetrical_garden_02_2k.hdr",
    function(texture){
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.encoding = THREE.sRGBEncoding;
        scene.environment = texture;
        scene.background = texture;

        new GLTFLoader().load(
            `../models/garage/1.gltf`,
            async function(gltf){
                let model = gltf.scene;
                camera = gltf.cameras[0];
                camera.fov = 32;
                camera.updateProjectionMatrix();
                model.traverse(function(node){
                    if(node.isMesh){
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });

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

const sun = new THREE.DirectionalLight(0xfff2e5, 10);
sun.position.set(5, 35, 8)
sun.castShadow = true;
sun.shadow.camera.top += 25;
sun.shadow.camera.bottom -= 25;
sun.shadow.camera.right += 25;
sun.shadow.camera.left -= 25;
sun.shadow.camera.near = 25;
sun.shadow.camera.far = 150;
sun.shadow.bias = -0.003;
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
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