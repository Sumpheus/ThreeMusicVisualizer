// import
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// camera +scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const color = new THREE.Color("#509510");
scene.background = color;

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


// cube
const geometry = new THREE.BoxGeometry( 2, 2, 2 );
const material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
// sphere
const sphereGeometry = new THREE.SphereGeometry( 1, 32, 32 );
const sphereMaterial = new THREE.MeshLambertMaterial( { color: "yellow" } );
const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.position.set(3, 0, 0);
scene.add( sphere );


// position
camera.position.z = 5;

// light
const light = new THREE.DirectionalLight( 0xffffff, 3.5 );
light.position.set( 5, 5, 5 ).normalize();
scene.add( light );

const light2 = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light2 );

// controls
const controls = new OrbitControls( camera, renderer.domElement );


function animate() {

  cube.rotation.x += 0.02;
  cube.rotation.y += 0.02;

  sphere.rotation.x += 0.01;
  sphere.rotation.y += 0.01;
  sphere.scale.x = Math.abs(Math.sin(Date.now() * 0.001)) + 0.5; // Pulsating effect 
  // render  

  renderer.render( scene, camera );

}