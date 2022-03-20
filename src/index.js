import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { PhysicsController } from './physics';

export class main {
    async init() {
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 10, 20000);
        this.camera.position.set (0,50,50);
        let system = new THREE.Object3D();
        this.scene.add(system);
        this.pointer = {};
        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor(new THREE.Color(0xEEEEEE));
        renderer.shadowMap.enabled = true;
        this.renderer = renderer;
        document.body.appendChild( renderer.domElement );
        this.controls = new OrbitControls(this.camera, this.renderer.domElement); 
 
        
        this.physicsCtrl = new PhysicsController();
        await this.physicsCtrl.init();
        this.setupEvents();
        this.createWorld(system);
        this.createLight();
        this.animate(system); 
        
        
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });    
        window.addEventListener( 'pointermove', (e) => this.onPointerMove(e) );
    }

    setupControls(system){
        document.addEventListener('keydown', (event) => {
            console.log(event.key);
            switch(event.key) {
                case 'w':
                    system.rotation.x = -0.1;
                    break;
                case 's':
                    system.rotation.x = 0.1;
                    break;
                case 'a':
                    system.rotation.z = 0.1;
                    break;
                case 'd':
                    system.rotation.z = -0.1;
                    break;
            }
            event.preventDefault();
            this.renderer.render(this.scene, this.camera );
        });
    }

    onPointerMove( event ) {

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
    
        this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    }

    createWorld(system) {
        this.createBall('', 1, 3, 1.5, 3, system);
        this.createWall('',10,1,10,0,0,0,system);
        this.createWall('',1,3,10,5,1.5,0,system);
        this.createWall('',10,3,1,0,1.5,5,system);
        this.createWall('',1,3,10,-5,1.5,0,system);
        this.createWall('',10,3,1,0,1.5,-5,system);
    }

    createBall(texture_name, radius, posX, posY, posZ, system) {
        var geometry = new THREE.SphereGeometry( radius, 32, 32 );
        var material = new THREE.MeshStandardMaterial( { 
            color: 0xff0000,
            metalness : 0.1
        });
        let mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = posX;
        mesh.position.y = posY;
        mesh.position.z = posZ;
        system.add(mesh);
        this.scene.add( mesh );
        const body = this.physicsCtrl.createBall(mesh, 1/2, 10, mesh.position, mesh.quaternion);
        
    }

    createWall(texture_name, sizeX, sizeY, sizeZ, posX, posY, posZ, system) {
        var geometry = new THREE.BoxGeometry( sizeX, sizeY, sizeZ );
        var material = new THREE.MeshStandardMaterial( { 
            color: 0x00ff00,
            transparent : true
        });
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = posX;
        mesh.position.y = posY;
        mesh.position.z = posZ;
        const vector = new THREE.Vector3(0, 0, -1);
        system.add(mesh);
        this.scene.add( mesh );
        
        const body = this.physicsCtrl.createWall(mesh, sizeX, sizeY, sizeZ, 0, mesh.position, mesh.quaternion);
    }

    createLight() {
        var light = new THREE.PointLight(0xffffff, 1, 20000, 2);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = this.camera.near;
        light.shadow.camera.far = this.camera.far;
        this.scene.add(new THREE.AmbientLight(0x404040));
        this.scene.add(light);
        
    }

    animate(system) {
        let tick = this.clock.getElapsedTime() / 10;
        this.setupControls(system);
        this.controls.update();
        requestAnimationFrame(() => this.animate());
        this.physicsCtrl.animate(tick);
        this.renderer.render( this.scene, this.camera );
    }
}
const module = new main();
module.init();