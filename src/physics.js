import Ammo from 'ammojs-typed';
//import * as THREE from 'three';
export class PhysicsController{
    async init(){
        await Ammo(Ammo);

        const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        const broadphase = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        const softBodySolver = new Ammo.btDefaultSoftBodySolver();
        this.world = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
        this.world.setGravity(new Ammo.btVector3(0, -10, 0));
        this.world.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, 0, 0));
        this.meshes = [];

    }

    createWall(objThree, sizeX, sizeY, sizeZ, mass, pos, quat){
        var transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        var motionState = new Ammo.btDefaultMotionState(transform);

        const localInertia = new Ammo.btVector3(0, 0, 0);
        const physicsShape = new Ammo.btBoxShape(new Ammo.btVector3( sizeX, sizeY, sizeZ ));
        physicsShape.calculateLocalInertia(mass, localInertia);

        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);
        this.world.addRigidBody(body);
        objThree.userData.physicsBody = body;
        body.mass = mass;
        this.meshes.push(objThree);
        return body;
    }

    
    createBall(objThree, radius, mass, pos, quat){
        var transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        var motionState = new Ammo.btDefaultMotionState(transform);

        const localInertia = new Ammo.btVector3(0, 0, 0);
        const physicsShape = new Ammo.btSphereShape(radius);
        physicsShape.calculateLocalInertia(mass, localInertia);

        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);
        this.world.addRigidBody(body);
        objThree.userData.physicsBody = body;
        body.mass = mass;
        this.meshes.push(objThree);
        return body;
    }

    
    applyImpulse(body, vector){
        body.applyCentralImpulse(new Ammo.btVector3(vector.x, vector.y, vector.z));
    }

    animate(delta){

        if (delta > 0) 
            this.world.stepSimulation(delta, 10);
        for(let objThree of this.meshes){
            this.syncPhysicsState(objThree);
        }
    }

    getPosition(objPhys){
        const ms = objPhys.getMotionState();
        const transform = new Ammo.btTransform();
        ms.getWorldTransform(transform);
        var p = transform.getOrigin();
        const tmp = new Ammo.btVector3(p.x(), p.y(), p.z());
        transform.__destroy__();
        return tmp;
    }

    syncPhysicsState(objThree) {
        const objPhys = objThree.userData.physicsBody;
        const ms = objPhys.getMotionState();
        const transform = new Ammo.btTransform();
        ms.getWorldTransform(transform);
        var p = transform.getOrigin();
        var q = transform.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
        transform.__destroy__();
    }
        

}