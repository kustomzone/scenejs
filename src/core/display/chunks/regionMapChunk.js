SceneJS_ChunkFactory.createChunkType({

    type: "regionMap",

    build: function () {
        this._uRegionMapRegionColor = this.program.draw.getUniform("SCENEJS_uRegionMapRegionColor");
        this._uRegionMapHighlightFactor = this.program.draw.getUniform("SCENEJS_uRegionMapHighlightFactor");
        this._uRegionMapHideAlpha = this.program.draw.getUniform("SCENEJS_uRegionMapHideAlpha");
        this._uRegionMapSampler = "SCENEJS_uRegionMapSampler";
    },

    draw: function (frameCtx) {

        var texture = this.core.texture;

        if (texture) {

            this.program.draw.bindTexture(this._uRegionMapSampler, texture, frameCtx.textureUnit);
            frameCtx.textureUnit = (frameCtx.textureUnit + 1) % SceneJS.WEBGL_INFO.MAX_TEXTURE_UNITS;
        }

        var gl = this.program.gl;
        var transparent = this.core.mode === "hide" || this.core.mode === "isolate";

        if (frameCtx.transparent != transparent) {

            if (transparent) {

                // Entering a transparency bin

                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                frameCtx.blendEnabled = true;

            } else {

                // Leaving a transparency bin

                gl.disable(gl.BLEND);
                frameCtx.blendEnabled = false;
            }

            frameCtx.transparent = transparent;
        }

        if (texture) {

            if (this._uRegionMapRegionColor) {
                this._uRegionMapRegionColor.setValue(this.core.regionColor);
            }

            if (this._uRegionMapHighlightFactor) {
                this._uRegionMapHighlightFactor.setValue(this.core.highlightFactor);
            }

            if (this._uRegionMapHideAlpha) {
                this._uRegionMapHideAlpha.setValue(this.core.hideAlpha);
            }

            frameCtx.regionMapUVLayerIdx = this.core.uvLayerIdx;

        } else {

            frameCtx.regionMapUVLayerIdx = -1;
        }
    },

    pick: function (frameCtx) {

        var texture = this.core.texture;

        if (texture) {

            frameCtx.regionData = this.core.regionData;

            frameCtx.textureUnit = 0;

            this.program.pick.bindTexture(this._uRegionMapSampler, texture, frameCtx.textureUnit);
            frameCtx.textureUnit = (frameCtx.textureUnit + 1) % SceneJS.WEBGL_INFO.MAX_TEXTURE_UNITS;

            frameCtx.regionMapUVLayerIdx = this.core.uvLayerIdx;

        } else {

            frameCtx.regionMapUVLayerIdx = -1;
        }
    }
});