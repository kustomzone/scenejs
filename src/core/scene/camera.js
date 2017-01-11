(function () {

    var defaultMatrix = SceneJS_math_perspectiveMatrix4(
        45, // fovy
        1, // aspect
        0.1, // near
        10000); // far

    var defaultMat = new Float32Array(defaultMatrix);

    // The default state core singleton for {@link SceneJS.Camera} nodes
    var defaultCore = {
        type: "camera",
        stateId: SceneJS._baseStateId++,
        matrix: defaultMatrix,
        mat: defaultMat,
        optics: {
            type: "perspective",
            fovy: 45.0,
            aspect: 1.0,
            near: 0.1,
            far: 10000.0
        },
        checkAspect: function (core, aspect) {
            if (core.optics.aspect != aspect) {
                core.optics.aspect = aspect;
                rebuildCore(this);
            }
        }
    };

    var coreStack = [];
    var stackLen = 0;

    // Set default core on the display at the start of each new scene compilation
    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.projTransform = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines the projection transform to apply to the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Camera = SceneJS_NodeFactory.createNodeType("camera");

    SceneJS.Camera.prototype._init = function (params) {
        if (this._core.useCount == 1) {

            params.optics = params.optics || {};
            var canvas = this.getScene().getCanvas();
            params.optics.aspect = canvas.width / canvas.height;
            this.setOptics(params.optics); // Can be undefined

            if (params.pan) {
                this.setPan(params.pan);
            }

            var self = this;

            this._canvasSizeSub = this.getScene().on("canvasSize",
                function (c) {
                    self._core.optics.aspect = c.aspect;
                    rebuildCore(self._core);
                    self._engine.display.imageDirty = true;
                });
        }
    };

    /**
     * Returns the default camera projection matrix
     * @return {Float32Array}
     */
    SceneJS.Camera.getDefaultMatrix = function () {
        return defaultMat;
    };

    SceneJS.Camera.prototype.setOptics = function (optics) {
        var core = this._core;
        if (!optics) {
            core.optics = {
                type: "perspective",
                fovy: 60.0,
                aspect: 1.0,
                near: 0.1,
                far: 10000.0
            };
        } else {
            var type = optics.type;
            if (!type) {
                if (core.optics) {
                    type = core.optics.type;
                }
            }
            type = type || "perspective";
            if (type == "ortho") {
                core.optics = SceneJS._applyIf(SceneJS_math_ORTHO_OBJ, {
                    type: type,
                    left: optics.left,
                    bottom: optics.bottom,
                    near: optics.near,
                    right: optics.right,
                    top: optics.top,
                    far: optics.far
                });
            } else if (type == "frustum") {
                core.optics = {
                    type: type,
                    left: optics.left || -1.0,
                    bottom: optics.bottom || -1.0,
                    near: optics.near || 0.1,
                    right: optics.right || 1.00,
                    top: optics.top || 1.0,
                    far: optics.far || 10000.0
                };
            } else if (type == "frustumAngles") {
                core.optics = {
                    type: type,
                    left: optics.left || 22,
                    down: optics.down || 22,
                    near: optics.near || 0.1,
                    right: optics.right || 22,
                    up: optics.up || 22,
                    far: optics.far || 10000.0
                };
            } else if (type == "perspective") {
                core.optics = {
                    type: type,
                    fovy: optics.fovy || 60.0,
                    aspect: optics.aspect == undefined ? 1.0 : optics.aspect,
                    near: optics.near || 0.1,
                    far: optics.far || 10000.0
                };
            } else if (!optics.type) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "SceneJS.Camera configuration invalid: optics type not specified - " +
                    "supported types are 'perspective', 'frustum', 'frustumAngles' and 'ortho'");
            } else {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "SceneJS.Camera configuration invalid: optics type not supported - " +
                    "supported types are 'perspective', 'frustum', 'frustumAngles' and 'ortho'");
            }
        }
        this._core.optics.pan = optics.pan;
        rebuildCore(this._core);
        this.publish("matrix", this._core.matrix);
        this._engine.display.imageDirty = true;
    };

    SceneJS.Camera.prototype.setPan = function (pan) {
        this._core.pan = pan;
        rebuildCore(this._core);
        this.publish("matrix", this._core.matrix);
        this._engine.display.imageDirty = true;
    };

    function rebuildCore(core) {
        var optics = core.optics;
        if (optics.type == "ortho") {
            core.matrix = SceneJS_math_orthoMat4c(
                optics.left,
                optics.right,
                optics.bottom,
                optics.top,
                optics.near,
                optics.far);

        } else if (optics.type == "frustum") {
            core.matrix = SceneJS_math_frustumMatrix4(
                optics.left,
                optics.right,
                optics.bottom,
                optics.top,
                optics.near,
                optics.far);

        } else if (optics.type == "frustumAngles") {
            core.matrix = SceneJS_math_frustumMatrix4FromAngles(
                optics.left,
                optics.right,
                optics.down,
                optics.up,
                optics.near,
                optics.far);

        } else if (optics.type == "perspective") {
            core.matrix = SceneJS_math_perspectiveMatrix4(
                optics.fovy * Math.PI / 180.0,
                optics.aspect,
                optics.near,
                optics.far);
        }

        if (core.pan) {
            // Post-multiply a screen-space pan
            var pan = core.pan;
            var panMatrix = SceneJS_math_translationMat4v([pan.x || 0, pan.y || 0, pan.z || 0]);
            core.matrix = SceneJS_math_mulMat4(panMatrix, core.matrix, []);
        }

        if (!core.mat) {
            core.mat = new Float32Array(core.matrix);
        } else {
            core.mat.set(core.matrix);
        }
    }

    SceneJS.Camera.prototype.getOptics = function () {
        var optics = {};
        for (var key in this._core.optics) {
            if (this._core.optics.hasOwnProperty(key)) {
                optics[key] = this._core.optics[key];
            }
        }
        return optics;
    };

    SceneJS.Camera.prototype.setMatrix = function (matrix) { // TODO: Extract clip planes from matrix
        this._core.matrix = matrix;
        this._core.mat = matrix;
        this.publish("matrix", this._core.matrix);
        this._engine.display.imageDirty = true;
    };

    SceneJS.Camera.prototype.getMatrix = function () {
        return SceneJS._sliceArray(this._core.matrix, 0);
    };

    SceneJS.Camera.prototype.setMatrix = function (matrix) { // TODO: Extract clip planes from matrix
        this._core.matrix = matrix;
        this._core.mat = matrix;
        this.publish("matrix", this._core.matrix);
        this._engine.display.imageDirty = true;
    };

    /**
     * Compiles this camera node, setting this node's state core on the display, compiling sub-nodes,
     * then restoring the previous camera state core back onto the display on exit.
     */
    SceneJS.Camera.prototype._compile = function (ctx) {
        this._engine.display.projTransform = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.projTransform = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.Camera.prototype._destroy = function () {
        this.getScene().off(this._canvasSizeSub);
    };
})();