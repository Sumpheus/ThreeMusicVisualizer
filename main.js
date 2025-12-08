import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//camera.position.set(0, 10, 30);
camera.position.set(25, 35, -20);

// Renderer setup with proper transparency
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

//audioPart
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

// Create ocean with waves
const waterGeometry = new THREE.PlaneGeometry(500*2, 500*2, 256, 256);
const ocean = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg', function(texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }),
  sunDirection: new THREE.Vector3(0, 1, 1).normalize(),
  sunColor: 0xffffff,
  waterColor: 0x1a8cff,
  distortionScale: 3,
  fog: false
});
ocean.rotation.x = -Math.PI / 2;
scene.add(ocean);

// Create sky dome
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
  color: 0x87CEEB,
  //color: 'beige',
  side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// Create realistic water sphere
const sphereRadius = 4;
const waterSphereGeometry = new THREE.SphereGeometry(sphereRadius, 128, 128);
const waterMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x55aaff,
  transmission: 0.97, // Glass-like transparency
  roughness: 0,
  metalness: 5,
  ior: 1.33, // Water's index of refraction
  thickness: sphereRadius,
  specularIntensity: 1,
  envMapIntensity: 1,
  transparent: true,
  opacity: 0.9
});

const waterSphere = new THREE.Mesh(waterSphereGeometry, waterMaterial);
waterSphere.position.y = 15; // Position above ocean
scene.add(waterSphere);

// Add internal water movement with particles
const particleCount = 200;
const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particleCount * 3);
const sizeArray = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  // Random position within sphere
  const radius = Math.random() * (sphereRadius * 0.8);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  
  posArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  posArray[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  posArray[i * 3 + 2] = radius * Math.cos(phi);
  
  sizeArray[i] = 0.05 + Math.random() * 0.15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true
});

const waterParticles = new THREE.Points(particlesGeometry, particlesMaterial);
waterSphere.add(waterParticles);

// Add surface ripples to sphere
const displacementMap = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg');
displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping;
waterMaterial.displacementMap = displacementMap;
waterMaterial.displacementScale = 0.2;

// Lighting setup
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const sphereLight = new THREE.PointLight(0x55aaff, 1.5, 20);
sphereLight.position.copy(waterSphere.position);
scene.add(sphereLight);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;
  
  // Animate ocean waves
  ocean.material.uniforms['time'].value = time * 0.5;
  
  // Animate water sphere surface
  waterMaterial.displacementMap.offset.x += 0.001;
  waterMaterial.displacementMap.offset.y += 0.001;
  
  // Gentle floating animation
  waterSphere.position.y = 15 + Math.sin(time * 0.7) * 0.5;
  waterSphere.rotation.y += 0.005;
  
  // Animate particles inside water
  const positions = particlesGeometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] += Math.sin(time * 0.5 + i) * 0.01;
    positions[i * 3 + 1] += Math.cos(time * 0.3 + i) * 0.01;
    positions[i * 3 + 2] += Math.sin(time * 0.4 + i) * 0.01;
    
    // Keep particles within sphere
    const dist = Math.sqrt(
      positions[i * 3] * positions[i * 3] + 
      positions[i * 3 + 1] * positions[i * 3 + 1] + 
      positions[i * 3 + 2] * positions[i * 3 + 2]
    );
    
    if (dist > sphereRadius * 0.8) {
      positions[i * 3] *= 0.95;
      positions[i * 3 + 1] *= 0.95;
      positions[i * 3 + 2] *= 0.95;
    }
  }
  particlesGeometry.attributes.position.needsUpdate = true;

  // Pulse the sphere light slightly
  sphereLight.intensity = 1.2 + Math.sin(time * 1.5) * 0.3;

   // Get audio data
   analyser.getByteFrequencyData(dataArray);
   // Calculate average volume (or use max for more punch)
   const avgFreq = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
   // Normalize (0..1)
   const audioLevel = avgFreq / 145;

   // Change water drop (sphere) size based on audio
  const scale = 1 + audioLevel * 2.5; // Adjust multiplier for effect strength
  waterSphere.scale.set(scale, scale, scale);
  
  // Change ocean color based on audio
  // Map audioLevel (0..1) to a color between blue and cyan
  const oceanColor = new THREE.Color().lerpColors(
    new THREE.Color(0x1a8cff), // base blue
    new THREE.Color(0x00fff7), // bright cyan
    Math.min(audioLevel, 1)
  );
  ocean.material.uniforms['waterColor'].value.copy(oceanColor);

  controls.update();
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
