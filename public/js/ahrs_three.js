var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
var X = new THREE.Vector3( -1, 0, 0 );
var Y = new THREE.Vector3( 0, 1, 0 );
var Z = new THREE.Vector3( 0, 0, 1 );
//normalize the direction vector (convert to vector of length 1)
// X.normalize();


var origin = new THREE.Vector3( 0, 0, 0 );
var length = 1;
var blue = 0x0000ff;
var red = 0xff0000;
var purple = 0xff00ff;

var xAxis = new THREE.ArrowHelper( X, origin, length, red );
cube.add( xAxis );
var yAxis = new THREE.ArrowHelper( Y, origin, length, blue );
cube.add( yAxis );
var zAxis = new THREE.ArrowHelper( Z, origin, length, purple );
cube.add( zAxis );
scene.add( cube );

camera.position.z = 5;
var d = new Date();


var animate = function () {
    requestAnimationFrame( animate );
    // rotate the cube on screen to match earable
    var a = new THREE.Euler( ahrs_heading, ahrs_pitch, ahrs_roll, 'XYZ' );
    cube.setRotationFromEuler(a);
    
    renderer.render( scene, camera );

};
function onDocumentMouseDown( event ) {
    cube.setRotationFromEuler(new THREE.Euler(0,0,0));
}
animate();