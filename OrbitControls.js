/**
 * @author qiao
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666
 *
 * OrbitControls allow the camera to orbit around a target.
 * This is a standalone version for non-module usage (<script> tag).
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
    this.keyPanSpeed = 7.0; // pixels moved per arrow key push

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

    var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };
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
        return Math.pow(0.95, scope.zoomSpeed);
    }

    function rotateLeft(angle) {
        sphericalDelta.theta -= angle;
    }

    function rotateUp(angle) {
        sphericalDelta.phi -= angle;
    }

    var panLeft = (function () {
        var v = new THREE.Vector3();
        return function panLeft(distance, objectMatrix) {
            v.setFromMatrixColumn(objectMatrix, 0);
            v.multiplyScalar(-distance);
            panOffset.add(v);
        };
    })();

    var panUp = (function () {
        var v = new THREE.Vector3();
        return function panUp(distance, objectMatrix) {
            v.setFromMatrixColumn(objectMatrix, 1);
            v.multiplyScalar(distance);
            panOffset.add(v);
        };
    })();

    var pan = (function () {
        var offset = new THREE.Vector3();
        return function pan(deltaX, deltaY) {
            var element = scope.domElement;
            if (scope.object.isPerspectiveCamera) {
                var position = scope.object.position;
                offset.copy(position).sub(scope.target);
                var targetDistance = offset.length();
                targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
                panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
                panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
            } else if (scope.object.isOrthographicCamera) {
                panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
                panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
            } else {
                console.warn('WARNING: OrbitControls encountered an unknown camera type - pan disabled.');
                scope.enablePan = false;
            }
        };
    })();

    function dollyIn(dollyScale) {
        if (scope.object.isPerspectiveCamera) {
            scale /= dollyScale;
        } else if (scope.object.isOrthographicCamera) {
            scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
            scope.object.updateProjectionMatrix();
            zoomChanged = true;
        } else {
            console.warn('WARNING: OrbitControls encountered an unknown camera type - dolly/zoom disabled.');
            scope.enableZoom = false;
        }
    }

    function dollyOut(dollyScale) {
        if (scope.object.isPerspectiveCamera) {
            scale *= dollyScale;
        } else if (scope.object.isOrthographicCamera) {
            scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
            scope.object.updateProjectionMatrix();
            zoomChanged = true;
        } else {
            console.warn('WARNING: OrbitControls encountered an unknown camera type - dolly/zoom disabled.');
            scope.enableZoom = false;
        }
    }

    // listeners
    function handleMouseDownRotate(event) {
        rotateStart.set(event.clientX, event.clientY);
    }

    function handleMouseMoveRotate(event) {
        rotateEnd.set(event.clientX, event.clientY);
        rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
        rotateLeft(2 * Math.PI * rotateDelta.x / scope.domElement.clientHeight);
        rotateUp(2 * Math.PI * rotateDelta.y / scope.domElement.clientHeight);
        rotateStart.copy(rotateEnd);
        scope.update();
    }

    function handleMouseDownDolly(event) {
        dollyStart.set(event.clientX, event.clientY);
    }

    function handleMouseMoveDolly(event) {
        dollyEnd.set(event.clientX, event.clientY);
        dollyDelta.subVectors(dollyEnd, dollyStart);
        if (dollyDelta.y > 0) {
            dollyIn(getZoomScale());
        } else if (dollyDelta.y < 0) {
            dollyOut(getZoomScale());
        }
        dollyStart.copy(dollyEnd);
        scope.update();
    }

    function handleMouseDownPan(event) {
        panStart.set(event.clientX, event.clientY);
    }

    function handleMouseMovePan(event) {
        panEnd.set(event.clientX, event.clientY);
        panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
        pan(panDelta.x, panDelta.y);
        panStart.copy(panEnd);
        scope.update();
    }

    // Public update
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

        if (scope.enableDamping) {
            sphericalDelta.theta *= (1 - scope.dampingFactor);
            sphericalDelta.phi *= (1 - scope.dampingFactor);
        } else {
            sphericalDelta.set(0, 0, 0);
        }

        scale = 1;
        panOffset.set(0, 0, 0);
        if (zoomChanged) {
            zoomChanged = false;
            scope.dispatchEvent(changeEvent);
        }
    };

    this.dispose = function () {
        scope.domElement.removeEventListener('mousedown', onMouseDown, false);
        scope.domElement.removeEventListener('mousemove', onMouseMove, false);
        scope.domElement.removeEventListener('mouseup', onMouseUp, false);
        scope.domElement.removeEventListener('wheel', onMouseWheel, false);
    };

    function onMouseDown(event) {
        event.preventDefault();
        switch (event.button) {
            case scope.mouseButtons.ORBIT: handleMouseDownRotate(event); state = STATE.ROTATE; break;
            case scope.mouseButtons.ZOOM: handleMouseDownDolly(event); state = STATE.DOLLY; break;
            case scope.mouseButtons.PAN: handleMouseDownPan(event); state = STATE.PAN; break;
        }
        scope.domElement.addEventListener('mousemove', onMouseMove, false);
        scope.domElement.addEventListener('mouseup', onMouseUp, false);
    }

    function onMouseMove(event) {
        event.preventDefault();
        switch (state) {
            case STATE.ROTATE: handleMouseMoveRotate(event); break;
            case STATE.DOLLY: handleMouseMoveDolly(event); break;
            case STATE.PAN: handleMouseMovePan(event); break;
        }
    }

    function onMouseUp() {
        scope.domElement.removeEventListener('mousemove', onMouseMove, false);
        scope.domElement.removeEventListener('mouseup', onMouseUp, false);
        state = STATE.NONE;
    }

    function onMouseWheel(event) {
        event.preventDefault();
        if (event.deltaY < 0) {
            dollyOut(getZoomScale());
        } else if (event.deltaY > 0) {
            dollyIn(getZoomScale());
        }
        scope.update();
    }

    this.domElement.addEventListener('mousedown', onMouseDown, false);
    this.domElement.addEventListener('wheel', onMouseWheel, false);
};

THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
