<!DOCTYPE html>
<html lang="en">
<head>
  <title>three.js webgl - materials - shaders [custom]</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
  <style>
  body {
    color: #ffffff;
    font-family:Monospace;
    font-size:13px;
    text-align:center;
    font-weight: bold;

    background-color: #777;
    margin: 0px;
    overflow: hidden;
  }

  #info {
    position: absolute;
    top: 0px; width: 100%;
    padding: 5px;
  }

  a {

    color: #ffffff;
  }

  #oldie a { color:#da0 }
  </style>
</head>
<body>

  <div id="container"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.js"></script>
  <script src="OrbitControls.js"></script>

  <!-- World coord (fragment) -->
  <script id="fragment_shader_world" type="x-shader/x-vertex">
  varying vec4 worldCoord;

  void main() {

    float r = 0.3;
    float g = 0.3;
    float b = 0.3;

    /*
    // a red band
    if(worldCoord.x > 1.0 && worldCoord.x < 1.5){
      r = 1.0;
    }
    */

    /*
    // half of the cube is blue
    if(worldCoord.z > 0.0){
      b = 1.0;
    }
    */

    r = abs(worldCoord.x);
    g = abs(worldCoord.y);
    b = abs(worldCoord.z * 2.0);


    gl_FragColor = vec4(r, g, b, 1.0);

  }

  </script>


  <!-- World coord (vertex) -->
  <script id="vertex_shader_world" type="x-shader/x-vertex">

  varying vec2 vUv;
  varying vec4 worldCoord;

  void main()
  {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    worldCoord = modelMatrix * vec4( position, 1.0 );

  }

  </script>







  <script>

  var container;
  var camera, scene, renderer;
  var uniforms;
  var clock = new THREE.Clock();

  init();
  animate();

  function init() {
    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 3000 );
    camera.position.z = 10;




    scene = new THREE.Scene();

    var geometry = new THREE.BoxGeometry( 0.75, 0.75, 0.75 );

    var anArray = new Array(4096);
    //var anArray = new Array(64);
    anArray[0] = 0;
    anArray[1] = 255;
    anArray[2] = 255;

    anArray[4093] = 128;
    anArray[4094] = 0;
    anArray[4095] = 128;


    uniforms = {
      //time:       { value: 1.0 },
      //resolution: { value: new THREE.Vector2() },
      //myArray: { type: "iv1", value: anArray },
      imageIndex: {value: 0},
    };

    var material = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertex_shader_world' ).textContent,
      fragmentShader: document.getElementById('fragment_shader_world' ).textContent
    });

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );


    controls = new THREE.OrbitControls(camera, renderer.domElement);
    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false );
  }


  function onWindowResize( event ) {
    //	uniforms.resolution.value.x = window.innerWidth;
    //	uniforms.resolution.value.y = window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }


  function animate() {
    requestAnimationFrame( animate );
    render();
  }


  function render() {
    var delta = clock.getDelta();
    //uniforms.time.value += delta * 5;

    //uniforms.imageIndex.value = Math.floor(globalCounter % tileNumber);
    uniforms.imageIndex.value = Math.floor((0.5+Math.cos(globalCounter)/2) * tileNumber);

    globalCounter += 0.005;

    var radius = 3;
    var cube = scene.children[ 0 ];
    //cube.rotation.y += delta * 0.25 * ( i % 2 ? 1 : -1 );
    //cube.rotation.x += delta * 0.25 * ( i % 2 ? -1 : 1 );
    cube.position.x = Math.cos(globalCounter)*radius;
    cube.position.y = Math.sin(globalCounter)*radius;

    //console.log(cube.position);

    renderer.render( scene, camera );
  }

  var controls = 0;
  var globalCounter = 0;
  var tileNumber = 64;
  var tileIterator = 1;

  </script>

</body>
</html>
