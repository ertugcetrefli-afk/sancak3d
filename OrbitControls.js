/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666
 *
 * This set of controls performs orbiting, dollying (zooming), and panning.
 * Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
 *
 */

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.target = new THREE.Vector3();

	this.minDistance = 0;
	this.maxDistance = Infinity;

	this.minZoom = 0;
	this.maxZoom = Infinity;

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	this.enableDamping = false;
	this.dampingFactor = 0.25;

	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	this.enablePan = true;
	this.panSpeed = 1.0;
	this.screenSpacePanning = false;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.enableKeys = true;

	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

	// internals

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {
		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
	}

	function getZoomScale() {
		return Math.pow( 0.95, scope.zoomSpeed );
	}

	function rotateLeft( angle ) {
		sphericalDelta.theta -= angle;
	}

	function rotateUp( angle ) {
		sphericalDelta.phi -= angle;
	}

	var panLeft = ( function () {
		var v = new THREE.Vector3();
		return function panLeft( distance, objectMatrix ) {
			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );
			panOffset.add( v );
		};
	}() );

	var panUp = ( function () {
		var v = new THREE.Vector3();
		return function panUp( distance, objectMatrix ) {
			v.setFromMatrixColumn( objectMatrix, 1 ); // get Y column of objectMatrix
			v.multiplyScalar( distance );
			panOffset.add( v );
		};
	}() );

	// (Bu dosya ~500 satır, burada kısaltıyorum. Sen RAW linkten alıp tamını kopyalayabilirsin.)
};
