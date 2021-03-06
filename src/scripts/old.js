/**
 * @author jonesjonathan
 */

import THREE from './three';

const SETTINGS = {
    lights : {
        enabled     : true,
        ambient     : true,
        point       : true
    }
};

const CAMERA_SETTINGS = {
    viewAngle   : 70,
    near        : 0.1,
    far         : 1000
};

//Utility globals

/** @type {THREE.Scene} */
    let scene;

/** @type {THREE.PerspectiveCamera}*/
    let camera;

/** @type {THREE.WebGLRenderer} */
    let renderer;

/** @type {HTMLElement} */
    let container;

/** @type {THREE.OrbitControls} */
    let controls;

/** @type {THREE.Raycaster} */
    let raycaster = new THREE.Raycaster();

/** @type {THREE.Vector2} */
    let mouse = new THREE.Vector2();

let height;
let width;
let aspect;

//Global objects
/** @type {THREE.PointLight} */
    let pointLight;

/** @type {THREE.Group} */
    let linkCubes; 

/**
 * Initialize website graphics
 */
function init() {
    getContainer();

    createCamera();
    createRenderer();

    createControls();

    createScene();

    initEventListeners();

    requestAnimationFrame(animate);
}

/**
 * 
 */
function getContainer() {
    container = document.getElementById("container");
    getDimensions();
}

function getDimensions() {
    width = container.clientWidth;
    height = container.clientHeight;
    aspect = width / height;
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(CAMERA_SETTINGS.viewAngle, aspect, CAMERA_SETTINGS.near, CAMERA_SETTINGS.far);
    camera.position.set(0, 0, 5);
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);
}

function createControls() {
    controls = new THREE.OrbitControls( camera );  
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.maxPolarAngle = 1.39626;
    controls.minPolarAngle = 1.39626;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.05;
}

function createScene() {
    scene = new THREE.Scene();

    initGeometry();
    initLinkCubes();

    if(SETTINGS.lights.enabled)
        initLighting();
}

function initGeometry() {
    
    /** @type {THREE.Object3D[]} */
    let objects = [];

    let geometry;
    let material;
    let mesh;

    let room = new THREE.Group();

    //Room objects
    geometry = new THREE.BoxGeometry(10, 4, 10, 15, 15, 15);
    material = new THREE.MeshLambertMaterial({color : 0x4286f4, side : THREE.BackSide});
    mesh = new THREE.Mesh(geometry, material);
    mesh.name = "Room";

    room.add(mesh);

    // TODO: Write a shader so that the interior wireframe fades into being visible as it gets farther away
    room.add(createWireframe(mesh, 0x4286f4, false));

    geometry = new THREE.CylinderGeometry(0.25, 1.5, 10, 12, 10);
    material = new THREE.MeshLambertMaterial({color : 0x4286f4});
    mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(-5, 0, -5);

    room.add(mesh);
    room.add(createEdgeframe(mesh, 0x4286f4));

    mesh = mesh.clone();
    mesh.position.set(5, 0, -5);

    room.add(mesh);
    room.add(createEdgeframe(mesh, 0x4286f4));

    mesh = mesh.clone();
    mesh.position.set(5, 0, 5);

    room.add(mesh);
    room.add(createEdgeframe(mesh, 0x4286f4));

    mesh = mesh.clone();
    mesh.position.set(-5, 0, 5);

    room.add(mesh);
    room.add(createEdgeframe(mesh, 0x4286f4));

    material = new THREE.MeshLambertMaterial({color : 0x4286f4, emissive : 0x4286f4, emissiveIntensity : 0.2});

    //Top cylinder
    geometry = new THREE.CylinderGeometry(2, 0.25, 2, 12, 10);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 2, 0);

    room.add(mesh);
    room.add(createEdgeframe(mesh, 0x4286f4));
    
    //Bottom cylinder
    geometry = new THREE.CylinderGeometry(0.25, 2, 2, 12, 10);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -2, 0);

    room.add(mesh);
    room.add(createEdgeframe(mesh, 0x4286f4));

    objects.push(room);

    addObjectsToScene(objects);
}

function initLinkCubes() {
    linkCubes = new THREE.Group();

    let geometry = new THREE.CubeGeometry(0.5, 0.5, 0.5, 10, 10, 10);
    let material = new THREE.MeshStandardMaterial({color : 0xf4b042});

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -0.2, -2);
    mesh.name = "Link-1";

    linkCubes.add(mesh);
    linkCubes.add(createEdgeframe(mesh, 0xffffff))

    mesh = mesh.clone(false);
    mesh.rotateY(3.14159);
    mesh.position.set(0, -0.2, 2);
    mesh.name = "Link-2";

    linkCubes.add(mesh);
    linkCubes.add(createEdgeframe(mesh, 0xffffff))
    
    scene.add(linkCubes);
}

/**
 * Creates a wireframe mesh of the given mesh
 * @param   {THREE.Mesh} mesh
 * @param   {THREE.Color} color
 * @param   {bool} interior - True : Interior - False : Exterior
 * @returns {THREE.LineSegments} THREE.LineSegments
 */
function createWireframe(mesh, color, interior) {
    let geo = new THREE.WireframeGeometry(mesh.geometry);

    let mat = new THREE.LineBasicMaterial({color : color});

    let wireframe = new THREE.LineSegments(geo, mat);

    wireframe.scale.copy(mesh.scale);

    if(interior)
        wireframe.scale.multiplyScalar(0.999);
    else
        wireframe.scale.multiplyScalar(1.001);

    wireframe.rotation.copy(mesh.rotation);
    wireframe.position.copy(mesh.position);
    return wireframe;
}

/**
 * Creates an outline of the edges on a given mesh
 * @param   {THREE.Mesh} mesh 
 * @param   {THREE.Color} color 
 * @returns {THREE.LineSegments} THREE.LineSegments
 */
function createEdgeframe(mesh, color)
{
    let geo = new THREE.EdgesGeometry(mesh.geometry);

    let mat = new THREE.LineBasicMaterial({color : color});
    
    let edges = new THREE.LineSegments(geo, mat);

    edges.scale.copy(mesh.scale);
    edges.rotation.copy(mesh.rotation);
    edges.position.copy(mesh.position);
    return edges;
}

function initLighting() {
    let lights = [];

    if(SETTINGS.lights.ambient) {
        let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        lights.push(ambientLight);
    }

    if(SETTINGS.lights.point) {
        pointLight = new THREE.PointLight(0xffffff, 0.8, 7.5, 1);
        pointLight.position.set(0, 0, 0);
        lights.push(pointLight);
    }

    addObjectsToScene(lights);
}

/**
 * 
 * @param {THREE.Object3D[]} objects 
 */
function addObjectsToScene(objects) {
    objects.forEach(function(mesh) {
        scene.add(mesh);
    });
}

function initEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
}

function onWindowResize(event) {
    getDimensions();
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function onMouseMove( event ) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
    let intersects = raycaster.intersectObjects([linkCubes.getObjectByName("Link-1"), linkCubes.getObjectByName("Link-2")], false);

    if(!intersects.length)
        document.getElementById("display-text").innerText = "";
    else 
        document.getElementById("display-text").innerText = intersects[0].object.name;
}

function animate(timestamp) {
    renderer.render(scene, camera);

    //Pulsing point light
    pointLight.intensity = 0.3 * Math.abs(Math.sin(timestamp * 0.001)) + 0.5;

    //Rotate link cubes
    linkCubes.children.forEach(function(cube) {
        cube.rotateX(0.01);
    });
    
    controls.update();
    requestAnimationFrame(animate);
}

window.onload = init;