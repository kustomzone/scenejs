SceneJS._webgl.Uniform = function (renderStats, gl, program, name, type, size, location, index, logging) {

    var func = null;

    var value = null;

    if (type === gl.BOOL) {

        func = function (v) {
            if (value === v) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value = v;
            gl.uniform1i(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.BOOL_VEC2) {
        value = new Array(2);

        func = function (v) {
            if (value[0] === v[0] && value[1] === v[1]) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value[0] = v[0];
            value[1] = v[1];
            gl.uniform2iv(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.BOOL_VEC3) {
        value = new Array(3);

        func = function (v) {
            if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value[0] = v[0];
            value[1] = v[1];
            value[2] = v[2];
            gl.uniform3iv(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.BOOL_VEC4) {
        value = new Array(4);

        func = function (v) {
            if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value[0] = v[0];
            value[1] = v[1];
            value[2] = v[2];
            value[3] = v[3];
            gl.uniform4iv(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.INT) {

        func = function (v) {
            if (value === v) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value = v;
            gl.uniform1iv(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.INT_VEC2) {
        value = new Uint32Array(2);

        func = function (v) {
            if (value[0] === v[0] && value[1] === v[1]) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value.set(v);
            gl.uniform2iv(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.INT_VEC3) {
        value = new Uint32Array(3);

        func = function (v) {
            if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value.set(v);
            gl.uniform3iv(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.INT_VEC4) {
        value = new Uint32Array(4);

        func = function (v) {
            if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value.set(v);
            gl.uniform4iv(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.FLOAT) {

        func = function (v) {
            if (value === v) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value = v;
            gl.uniform1f(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.FLOAT_VEC2) {
        value = new Float32Array(2);

        func = function (v) {
            if (value[0] === v[0] && value[1] === v[1]) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value.set(v);
            gl.uniform2fv(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.FLOAT_VEC3) {
        value = new Float32Array(3);

        func = function (v) {
            if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value.set(v);
            gl.uniform3fv(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.FLOAT_VEC4) {
        value = new Float32Array(4);

        func = function (v) {
            if (value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                renderStats.setUniformCacheHits++;
                return;
            }
            value.set(v);
            gl.uniform4fv(location, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.FLOAT_MAT2) {

        func = function (v) {
            gl.uniformMatrix2fv(location, gl.FALSE, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.FLOAT_MAT3) {

        func = function (v) {
            gl.uniformMatrix3fv(location, gl.FALSE, v);
            renderStats.setUniform++;
        };

    } else if (type === gl.FLOAT_MAT4) {

        func = function (v) {

            // Caching this matrix is actually slower than not caching

            gl.uniformMatrix4fv(location, gl.FALSE, v);
            renderStats.setUniform++;
        };

    } else {
        throw "Unsupported shader uniform type: " + type;
    }

    this.setValue = func;

    this.getLocation = function () {
        return location;
    };

    // This is just an integer key for caching the uniform's value, more efficient than caching by name.
    this.index = index;
};










