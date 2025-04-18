import * as THREE from "three";
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let bokeh, camera, ssaoPass, stats;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputMapping = THREE.sRGBEncoding;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById("canvas").appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);

new RGBELoader().load(
    "../models/garage/blocky_photo_studio_2k.hdr",
    function(texture){
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.encoding = THREE.sRGBEncoding;
        scene.environment = texture;
        scene.background = texture;

        new GLTFLoader().load(
            `../models/garage/1.gltf`,
            async function(gltf){
                let model = gltf.scene;
                model.traverse(function(node){
                    if(node.isMesh){
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });

                let cameras = gltf.cameras;
                camera = cameras[0];
                camera.fov = 32;

                composer.addPass(new RenderPass(scene, camera));
                ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
                composer.addPass(ssaoPass);
                bokeh = new BokehPass(scene, camera,{
                    focus: 31,
                    aperture: 6.1,
                    maxblur: 0.01
                });
                composer.addPass(bokeh);
                composer.addPass(new SMAAPass());
                composer.addPass(new OutputPass());

                stats = new Stats();
                stats.showPanel(0);
                document.getElementById("canvas").appendChild( stats.dom );

                const gui = new GUI();
                gui.add( effectController, 'focus', 0, 100, 1 ).onChange( matChanger );
                gui.add( effectController, 'aperture', 0, 10, 0.1 ).onChange( matChanger );
                gui.add( effectController, 'maxblur', 0.0, 0.01, 0.001 ).onChange( matChanger );
                gui.close();

                matChanger();

                gui.add( ssaoPass, 'output', {
                    'Default': SSAOPass.OUTPUT.Default,
                    'SSAO Only': SSAOPass.OUTPUT.SSAO,
                    'SSAO Only + Blur': SSAOPass.OUTPUT.Blur,
                    'Depth': SSAOPass.OUTPUT.Depth,
                    'Normal': SSAOPass.OUTPUT.Normal
                } ).onChange( function ( value ) {

                    ssaoPass.output = value;

                } );
                gui.add( ssaoPass, 'kernelRadius' ).min( 0 ).max( 32 );
                gui.add( ssaoPass, 'minDistance' ).min( 0.001 ).max( 0.02 );
                gui.add( ssaoPass, 'maxDistance' ).min( 0.01 ).max( 0.3 );
                gui.add( ssaoPass, 'enabled' );

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

const sun = new THREE.DirectionalLight(0xfff2e5, 5);
sun.position.set(5, 35, 8);
sun.castShadow = true;
sun.shadow.camera.top += 25;
sun.shadow.camera.bottom -= 25;
sun.shadow.camera.right += 25;
sun.shadow.camera.left -= 25;
sun.shadow.camera.near = 25;
sun.shadow.camera.far = 150;
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
scene.add(sun);

function animate(){
    stats.begin();
    let time = Date.now() * 0.005;
    sun.position.y = Math.sin(time * 0.07) * 35;
    sun.position.z = Math.sin(time * 0.07) * 35;

    requestAnimationFrame(animate);
    composer.render();
    stats.end();
}

const effectController = {

    focus: 31,
    aperture: 6.1,
    maxblur: 0.01

};

const matChanger = function ( ) {

    bokeh.uniforms[ 'focus' ].value = effectController.focus;
    bokeh.uniforms[ 'aperture' ].value = effectController.aperture * 0.00001;
    bokeh.uniforms[ 'maxblur' ].value = effectController.maxblur;

};

window.addEventListener("resize", function(){
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
   renderer.setSize(window.innerWidth, window.innerHeight);
});