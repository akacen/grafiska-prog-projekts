import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import { PhysicsController } from './physics';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export class main {

    async init() {
        this.marsDistance = 227940;
        this.clock = new THREE.Clock();
        this.planets = [];
        this.animationMixers = [];
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1000, this.marsDistance * 20);
        this.camera.position.z = -100000;
        this.pointer = {};
        this.raycaster = new THREE.Raycaster();

        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xEEEEEE);
        // renderer.shadowMap.enabled = true;
        this.renderer = renderer;
        document.body.appendChild(renderer.domElement);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        var gui = new dat.GUI({ name: 'My  gui' });
        const config = { radius: 6000, mass: 400, impulse: 1000000 };
        gui.add(config, 'radius', 1000, 20000);
        gui.add(config, 'mass', 40, 10000);
        gui.add(config, 'impulse', 990000, 99000000);

        gui.add({
            add: () => {
                const planet = this.createPlanet('earth', '2k_earth_daymap.jpg', 0, config.radius);
                const vector = new THREE.Vector3(0, 0, -1);
                vector.applyQuaternion(this.camera.quaternion);
                const cameraPos = this.camera.position.clone();
                const newPosition = cameraPos.addScaledVector(vector, 24000);
                planet.position.copy(newPosition);
                const body = this.physicsController.createPlanet(planet, config.radius, config.mass, planet.position, planet.quaternion);
                this.physicsController.applyImpulse(body, vector.multiplyScalar(config.impulse));
            }
        }, 'add');

        this.physicsController = new PhysicsController();
        await this.physicsController.init();
        this.setupEvents();
        this.createWorld();
        this.createLights();
        this.animate();
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    }

    onPointerMove(event) {

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components

        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    }

    createWorld() {
        this.createSun();
    }

    createPlanet(name, texture_name, distance, radius) {
        var geometry = new THREE.SphereGeometry(radius, 32, 32);
        var material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(texture_name),
            metalness: 0
        });

        let planet = new THREE.Mesh(geometry, material);
        let system = new THREE.Object3D();
        system.add(planet);
        this.scene.add(system);

        // planet.castShadow = true;
        // planet.receiveShadow = true;
        this.planets.push(system);

        const loader = new GLTFLoader();

        loader.load('turtle/scene.gltf', (gltf) => {
            const model = gltf.scene;
            const turtleSystem = new THREE.Object3D();
            turtleSystem.add(model);
            system.add(turtleSystem);
            model.position.y = radius + 5000;
            model.scale.set(100, 100, 100);

            const mixer = new THREE.AnimationMixer(model);
            const clips = gltf.animations;
            this.animationMixers.push(mixer);

            const clip = THREE.AnimationClip.findByName(clips, 'Swim Cycle');
            const action = mixer.clipAction(clip);
            action.play();

            clips.forEach(function (clip) {
                mixer.clipAction(clip).play();
            });

        }, undefined, (error) => {
            console.error(error);
        });

        return system;

    }

    createMoon(name, texture_name, distance, radius, system) {

    }

    createSun() {
        var geometry = new THREE.SphereGeometry(69700 / 2, 32, 32);
        var material = new THREE.MeshStandardMaterial({
            emissive: 0xEEEE99,
            emissiveIntensity: 0.8,
            map: new THREE.TextureLoader().load('2k_sun.jpg')
        });

        this.sun = new THREE.Mesh(geometry, material);
        this.scene.add(this.sun);
        const body = this.physicsController.createPlanet(this.sun, 69700 / 2, 90000000, this.sun.position, this.sun.quaternion);

    }

    createLights() {
        var sunLight = new THREE.PointLight(0xffffff, 1, this.marsDistance * 20, 1);

        this.scene.add(new THREE.AmbientLight(0x404040));
        this.scene.add(sunLight);

        // sunLight.castShadow = true;
        // sunLight.shadow.mapSize.width = 1024;
        // sunLight.shadow.mapSize.height = 1024;
        // sunLight.shadow.camera.near = this.camera.near;
        // sunLight.shadow.camera.far = this.camera.far;
    }

    animate() {
        this.controls.update();
        const deltaSeconds = this.clock.getDelta();

        for (let planet of this.planets) {
            if (planet.children.length > 1) {
                planet.children[1].rotation.x -= 0.01;
            }
        }

        for (let mixer of this.animationMixers) {
            mixer.update(deltaSeconds);
        }

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        for (let i = 0; i < intersects.length; i++) {
            intersects[i].object.material.color.set(0xff0000);
        }

        requestAnimationFrame(() => this.animate());

        this.physicsController.animate(deltaSeconds);
        this.renderer.render(this.scene, this.camera);
    }
}

const module = new main();
module.init();
