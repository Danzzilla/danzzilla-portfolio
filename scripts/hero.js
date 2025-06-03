import * as THREE from "three";
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

//initialize global variables
let renderer, camera, composer, bokeh, ssaoPass, sun, blueLight, orangeLight, firstLight, sunrise, daytime,
    sunset, lastLight, dawnlength, dusklength, date, time, dateString,
    autosun = true;
let darkToggle = document.getElementById("darkmode-toggle");
let autoToggle = document.getElementById("auto-toggle");

//Initialize

//FPS
let stats = new Stats();
stats.showPanel(0);
document.getElementById("canvas").appendChild( stats.dom );

//Scene
const scene = new THREE.Scene();

//Renderer
renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputMapping = THREE.sRGBEncoding;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById("canvas").appendChild(renderer.domElement);

//Load HDRI and Model
new RGBELoader().load(
    "../models/garage/horn-koppe_snow_2k.hdr",
    function(texture){
        //HDRI Texture
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.encoding = THREE.sRGBEncoding;
        scene.environment = texture;
        scene.background = texture;

        //Load Model
        new GLTFLoader().load(
            `../models/garage/1.gltf`,
            async function(gltf){
                let model = gltf.scene;
                model.traverse(function(node){
                    if(node.isMesh){
                        //Allow Shadows
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });

                //Set Camera from Model
                let cameras = gltf.cameras;
                camera = cameras[0];
                camera.aspect = document.documentElement.clientWidth / document.documentElement.clientHeight;
                camera.fov = 32;
                camera.updateProjectionMatrix();

                //Add Model
                scene.add(model);

                initializeObjects();
                collectSunData();

                //AfterEffects Composer
                composer = new EffectComposer(renderer);

                //Render Pass
                composer.addPass(new RenderPass(scene, camera));

                //AA Pass
                composer.addPass(new SMAAPass());

                //AO Pass
                ssaoPass = new SSAOPass(scene, camera, document.documentElement.clientWidth, document.documentElement.clientHeight);
                ssaoPass.kernelRadius = 16.3;
                ssaoPass.minDistance = 0.001;
                ssaoPass.maxDistance = 0.3;
                composer.addPass(ssaoPass);

                //Depth of Field
                bokeh = new BokehPass(scene, camera, {
                    focus: 24,
                    aperture: 6.1 * 0.00001,
                    maxblur: 0.01
                });
                composer.addPass(bokeh);

                //Output Pass
                composer.addPass(new OutputPass());

                //Compile and Render
                await renderer.compileAsync(model, camera, scene);
                animate();
            },
            function(xhr){
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    console.log(percentComplete.toFixed(2) + "% Loaded");
                } else {
                    console.log("Loading... " + xhr.loaded + " bytes loaded");
                }
                console.log(xhr);
            },
            function(error){
                //Errors
                console.error(error);
            }
        );
    }
);

function initializeObjects(){
    //sun
    sun = new THREE.DirectionalLight(0xffffff, 35);
    sun.position.set(6.5, 60, 0);
    sun.target.position.set(-9.2, -1.28, -9.2)
    sun.castShadow = true;
    sun.shadow.camera.top += 30;
    sun.shadow.camera.bottom -= 30;
    sun.shadow.camera.right += 30;
    sun.shadow.camera.left -= 30;
    sun.shadow.camera.near = 20;
    sun.shadow.camera.far = 100;
    sun.shadow.mapSize.width = 8096;
    sun.shadow.mapSize.height = 8096;
    sun.shadow.bias = -0.002;

    //blue light
    blueLight = new THREE.PointLight(0x46fafb, 15000);
    blueLight.position.set(-13, 3, 9.5);
    blueLight.castShadow = true;
    blueLight.shadow.mapSize.width = 4096;
    blueLight.shadow.mapSize.height = 4096;
    blueLight.shadow.bias = -0.001

    //orange light
    orangeLight = new THREE.PointLight(0xFF952D, 15000);
    orangeLight.position.set(-13, 3, -28.3);
    orangeLight.castShadow = true;
    orangeLight.shadow.mapSize.width = 4096;
    orangeLight.shadow.mapSize.height = 4096;
    orangeLight.shadow.bias = -0.001;
}

function collectSunData() {
    fetch("https://api.sunrisesunset.io/json?lat=47.606209&lng=-122.332069&time_format=24")
        .then(response => response.json())
        .then(data => {
            let sunIO = data['results'];
            //Accurate Date (Sometimes API gives inaccurate date
            dateString = new Date(sunIO['date']).toISOString().split("T")[0];
            firstLight = new Date(dateString + "T" + sunIO['first_light']);
            sunrise = new Date(dateString + "T" + sunIO['sunrise']).getTime();
            lastLight = new Date(dateString + "T" + sunIO['last_light']).getTime();
            sunset = new Date(dateString + "T" + sunIO['sunset']).getTime();
            daytime = sunset - sunrise;
            dawnlength = sunrise - firstLight;
            dusklength = lastLight - sunset;
        })
        .catch(error => console.error('Error:', error));
}

function animate(){
    stats.begin();

    if(autosun){
        sunController();
    }
    requestAnimationFrame(animate);
    composer.render();
    stats.end();
}

function sunController(){
    //current time
    time = Date.now();

    //every hour, check if date stored is correct
    if(time % 3600000 === 0){ //TODO Fix
        let actualDate;
        fetch("https://api.sunrisesunset.io/json?lat=47.606209&lng=-122.332069&time_format=24")
            .then(response => response.json())
            .then(data => {
                actualDate = new Date(data['results']['date']);
            })
            .catch(error => console.error('Error:', error));

        if(date !== actualDate){
            collectSunData();
        }
    }

    if(firstLight < time && time < sunrise){
        //dawn controls
        scene.remove(blueLight);
        scene.remove(sun);
        scene.add(orangeLight);
        orangeLight.intensity = 15000 - (((time - firstLight)/dawnlength) * 15000);
        renderer.toneMappingExposure = 0.05 + (((time - firstLight)/dawnlength) * 0.45);
        darkToggle.checked = false;
    }else if(sunrise < time && time < sunset) {
        //day controls
        scene.remove(blueLight);
        scene.remove(orangeLight);
        renderer.toneMappingExposure = 0.5;
        sun.position.z = -Math.cos((time - sunrise) / (daytime / Math.PI)) * 60;
        sun.position.y = Math.sin((time - sunrise) / (daytime / Math.PI)) * 60;
        scene.add(sun);
        darkToggle.checked = false;
    }else if(sunset < time && time < lastLight){
        //dusk controls
        scene.remove(sun);
        scene.remove(orangeLight);
        scene.add(blueLight);
        blueLight.intensity = ((time - sunset)/dusklength) * 15000;
        renderer.toneMappingExposure = 0.5 - (((time - sunset)/dusklength) * 0.45);
        darkToggle.checked = false;
    }else{
        //night controls
        scene.remove(sun);
        scene.remove(orangeLight);
        scene.add(blueLight);
        blueLight.intensity = 15000;
        renderer.toneMappingExposure = 0.05;
        darkToggle.checked = true;
    }
}

darkToggle.addEventListener('change', function(){
    if(this.checked){
        //turn off auto sun
        autoToggle.checked = true;
        autosun = false;
        renderer.toneMappingExposure = 0.05;
        scene.remove(sun);
        scene.add(orangeLight);
        scene.add(blueLight);
    }else{
        //turn off auto sun
        autoToggle.checked = true;
        autosun = false;
        renderer.toneMappingExposure = 0.5;
        scene.add(sun);
        sun.position.set(6.5, 60, 0);
        scene.remove(orangeLight);
        scene.remove(blueLight);
    }
});

autoToggle.addEventListener('change', function(){
    autosun = !this.checked;
});

window.addEventListener("resize", function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});