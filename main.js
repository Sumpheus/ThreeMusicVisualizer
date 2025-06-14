// import
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// camera +scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const color = new THREE.Color("#c9371a");
scene.background = color;

//Texture loader
// Load the image as a texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load('testimage.jpeg', (texture) => {
  scene.background = texture; // Set the loaded texture as the background
});

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
//cylinder
const cylinderGeometry = new THREE.CylinderGeometry( 1, 1, 2, 32 );
const cylinderMaterial = new THREE.MeshLambertMaterial( { color: "red" } );
const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
cylinder.position.set(-3, 0, 0);
scene.add( cylinder );

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

//animate
function animate() {
  
  cube.rotation.x += 0.02;
  cube.rotation.y += 0.02;

  sphere.rotation.x += 0.01;
  sphere.rotation.y += 0.01;
  sphere.scale.x = Math.abs(Math.sin(Date.now() * 0.001)) + 0.5; // Pulsating effect 

// Change the cube's color dynamically
const time = Date.now() * 0.001; // Get the current time
const color = new THREE.Color(
  Math.sin(time) * 0.8 + 0.8, // Red channel
  Math.sin(time + Math.PI / 2) * 0.5 + 0.5, // Green channel
  Math.sin(time + Math.PI) * 0.6 + 0.6 // Blue channel
);
cube.material.color = color;  

// Cylinder animation
analyser.getByteFrequencyData(dataArray);

  // Use the average frequency to scale the cylinder
  const averageFrequency = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
  const scale = averageFrequency / 128; // Normalize the scale value
  const rotationSpeed = averageFrequency / 128; // Speed of rotation
  cylinder.rotation.y += rotationSpeed * 0.05; // Rotate based on frequency
  cylinder.rotation.x += rotationSpeed * 0.05; // Rotate based on frequency
  cylinder.scale.set(1, scale, 1); // Change height based on frequency
  cube.scale.set(1, scale, 1); // Change height based on frequency
  sphere.scale.set(1, scale, 1); // Change height based on frequency

  // render  
  renderer.render( scene, camera );

}

// AUDIO Part

const trackInput = document.getElementById('track');
const audioPlayer = document.getElementById('audio1');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256; // Set the FFT size for frequency analysis
const dataArray = new Uint8Array(analyser.frequencyBinCount);

trackInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const fileURL = URL.createObjectURL(file);
    audioPlayer.src = fileURL;
    audioPlayer.play();

    const source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }
});