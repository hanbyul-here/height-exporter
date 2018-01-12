var THREE = require('three');

var OrbitControls = require('three-orbitcontrols')
import store from './redux/store'

const setScene = function (resultArr) {

  const grid = store.getState()['grid'];
  const scale = store.getState()['unit'];
  const downDefault = 500;

  var camera, scene, renderer;
  var plane;

  init();
  animate();

  function init() {
    camera = new THREE.PerspectiveCamera( 70, 1, 1, 1000 );
    camera.position.z = 600;
    scene = new THREE.Scene();

    var geometry = new THREE.PlaneGeometry( (grid-1)*scale, (grid-1)*scale, (grid-1),(grid-1) );
    var material = new THREE.MeshBasicMaterial( {color: 0x2194ce,  wireframe: true, vertexColors: THREE.VertexColors} );
    plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(500, 500 );
    document.getElementById('preview-box').appendChild( renderer.domElement );


    var controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controls.enableZoom = false


    var flattenedArray = resultArr.reduce((prev, curr) => {return prev.concat(curr)}, []);
    console.log(flattenedArray.length);
    console.log(plane.geometry.vertices.length);

    let offset = store.getState()['offset'];

    for (let i = 0; i < plane.geometry.vertices.length; i++ ) {
      plane.geometry.vertices[i].z = flattenedArray[i] - offset;
    }

    window.addEventListener( 'resize', onWindowResize, false );
  }


  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }


  function animate() {
    requestAnimationFrame( animate );
    //plane.rotation.x += 0.005;
    //plane.rotation.y += 0.01;


    renderer.render( scene, camera );
  }
}

module.exports = { setScene };