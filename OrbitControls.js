/**
 * OrbitControls — three.js r128 classic version
 * Non-module build, works with <script> tag
 */

THREE.OrbitControls = function ( object, domElement ) {

    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // API
    this.enabled = true;
    this.target = new THREE.Vector3();

    this.minDistance = 0;
    this.maxDistance = Infinity;

    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    this.enableDamping = false;
    this.dampingFactor = 0.25;

    this.enableZoom = true;
    this.zoomSpeed = 1.0;

    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    this.enablePan = true;
    this.panSpeed = 1.0;
    this.screenSpacePanning = false;

    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    this.enableKeys = true;
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
    this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

    // internals
    var scope = this;
    var changeEvent = { type: 'change' };

    var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };
    var state = STATE.NONE;

    var EPS = 0.000001;
    var spherical = new THREE.Spherical();
    var sphericalDelta = new THREE.Spherical();

    var scale = 1;
    var panOffset = new THREE.Vector3();
    var zoomChanged = false;

    // listeners
    function onMouseDown(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
        if (event.button === scope.mouseButtons.ORBIT) {
            state = STATE.ROTATE;
        } else if (event.button === scope.mouseButtons.ZOOM) {
            state = STATE.DOLLY;
        } else if (event.button === scope.mouseButtons.PAN) {
            state = STATE.PAN;
        }
        scope.domElement.addEventListener('mousemove', onMouseMove, false);
        scope.domElement.addEventListener('mouseup', onMouseUp, false);
    }

    function onMouseMove(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
        if (state === STATE.ROTATE) {
            rotateLeft(2 * Math.PI * event.movementX / scope.domElement.clientWidth * scope.rotateSpeed);
            rotateUp(2 * Math.PI * event.movementY / scope.domElement.clientHeight * scope.rotateSpeed);
        } else if (state === STATE.DOLLY) {
            dollyIn(Math.pow(0.95, scope.zoomSpeed));
        } else if (state === STATE.PAN) {
            pan(event.movementX, event.movementY);
        }
        scope.update();
    }

    function onMouseUp() {
        scope.domElement.removeEventListener('mousemove', onMouseMove, false);
        scope.domElement.removeEventListener('mouseup', onMouseUp, false);
        state = STATE.NONE;
    }

    function dollyIn(dollyScale) {
        scale /= dollyScale;
    }
    function dollyOut(dollyScale) {
        scale *= dollyScale;
    }

    function rotateLeft(angle) {
        sphericalDelta.theta -= angle;
    }
    function rotateUp(angle) {
        sphericalDelta.phi -= angle;
    }

    function pan(deltaX, deltaY) {
        var offset = new THREE.Vector3();
        var element = scope.domElement;
        var targetDistance = scope.object.position.distanceTo(scope.target);
        offset.setFromMatrixColumn(scope.object.matrix, 0); // get X column
        offset.multiplyScalar(-2 * deltaX * targetDistance / element.clientHeight);
        panOffset.add(offset);
        offset.setFromMatrixColumn(scope.object.matrix, 1); // get Y column
        offset.multiplyScalar(2 * deltaY * targetDistance / element.clientHeight);
        panOffset.add(offset);
    }

    this.update = function () {
        var offset = new THREE.Vector3();
        offset.copy(scope.object.position).sub(scope.target);
        spherical.setFromVector3(offset);
        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;
        spherical.makeSafe();
        spherical.radius *= scale;
        scope.target.add(panOffset);
        offset.setFromSpherical(spherical);
        scope.object.position.copy(scope.target).add(offset);
        scope.object.lookAt(scope.target);

        sphericalDelta.set(0, 0, 0);
        scale = 1;
        panOffset.set(0, 0, 0);
        zoomChanged = false;

        scope.dispatchEvent(changeEvent);
    };

    this.dispose = function () {
        scope.domElement.removeEventListener('mousedown', onMouseDown, false);
        scope.domElement.removeEventListener('mousemove', onMouseMove, false);
        scope.domElement.removeEventListener('mouseup', onMouseUp, false);
    };

    this.domElement.addEventListener('mousedown', onMouseDown, false);
};

THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
