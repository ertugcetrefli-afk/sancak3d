/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

THREE.OrbitControls = function ( object, domElement ) {

	if ( domElement === undefined ) console.warn( 'THREE.OrbitControls: The second parameter "domElement" is now mandatory.' );
	if ( domElement === document ) console.error( 'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.' );

	this.object = object;
	this.domElement = domElement;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	this.enableDamping = false;
	this.dampingFactor = 0.05;

	// dolly (zoom) ayarları
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// rotate ayarları
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// pan ayarları
	this.enablePan = true;
	this.panSpeed = 1.0;
	this.screenSpacePanning = false;
	this.keyPanSpeed = 7.0;

	// otomatik dönme
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 saniyede bir tam tur

	// klavye
	this.enableKeys = true;
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// mouse butonları
	this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };

	// update
	var scope = this;
	var EPS = 0.000001;
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();
	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	this.update = function () {
		var offset = new THREE.Vector3();

		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().invert();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function update () {
			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );
			offset.applyQuaternion( quat );

			spherical.setFromVector3( offset );

			if ( scope.autoRotate && scope.enableRotate ) {
				var autoRotateAngle = 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
				sphericalDelta.theta -= autoRotateAngle;
			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );
			spherical.makeSafe();

			spherical.radius *= scale;
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );
			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {
				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );
				panOffset.multiplyScalar( 1 - scope.dampingFactor );
			} else {
				sphericalDelta.set( 0, 0, 0 );
				panOffset.set( 0, 0, 0 );
			}

			scale = 1;

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;
			}

			return false;
		};
	}();

	this.dispose = function () {
		this.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		this.domElement.removeEventListener( 'wheel', onMouseWheel, false );
		this.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		this.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		this.domElement.removeEventListener( 'touchmove', onTouchMove, false );
		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		window.removeEventListener( 'keydown', onKeyDown, false );
	};

	function onContextMenu( event ) { event.preventDefault(); }
	function onMouseDown( event ) { /* mouse kontrol kodları */ }
	function onMouseMove( event ) { /* mouse hareket kodları */ }
	function onMouseUp( event ) { /* mouse bırakma kodları */ }
	function onMouseWheel( event ) { /* zoom kodları */ }
	function onKeyDown( event ) { /* klavye kontrol kodları */ }
	function onTouchStart( event ) { /* dokunma başlat */ }
	function onTouchMove( event ) { /* dokunma hareket */ }
	function onTouchEnd( event ) { /* dokunma bitiş */ }

	this.domElement.addEventListener( 'contextmenu', onContextMenu, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'wheel', onMouseWheel, false );
	this.domElement.addEventListener( 'touchstart', onTouchStart, false );
	this.domElement.addEventListener( 'touchend', onTouchEnd, false );
	this.domElement.addEventListener( 'touchmove', onTouchMove, false );
	window.addEventListener( 'keydown', onKeyDown, false );
};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
