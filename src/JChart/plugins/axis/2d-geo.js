import {
    mat2d
} from 'gl-matrix';
import { effect } from '@vue/reactivity';

class Geo2D {
    constructor() {
        this.name = "Geo2D";
        this.pin = {
            trigger: false,
            originX: 0,
            originY: 0,
            originMtx: null,
            offsetX: 0,
            offsetY: 0,
            zoom: 1,
        };

        this.meta = {
            originX: 0,
            originY: 0,
        };

    }

    apply(globalCtx) {
        globalCtx.Coordinate.hooks.initCoord.tap(this.name, () => {
            this.init(globalCtx);
        });

        globalCtx.Coordinate.hooks.renderCoord.tap(this.name, (context2d) => {
            context2d.beginPath();
            context2d.arc(0, 0, 2, 0, 2 * Math.PI);
            context2d.fill();
            context2d.beginPath();
            context2d.arc(0, 0, 50, 0, 2 * Math.PI);
            context2d.stroke();
            // context2d.getTransform();
            // console.log('ssssssss');
            context2d.render();
        });

        // globalCtx.Coordinate.hooks.afterRenderChart.tap(this.name, (context2d) => {

        //     context2d.render();
        // });
    }

    init(globalCtx) {
        globalCtx.effect(() => {
            const {
                translateMtx,
                translateMtxInvert,
                rawSpanHorizontal: layoutsh,
                spanVertical: layoutsv,
            } = globalCtx.Layout;

            const imtx = mat2d.create();
            // const geoMtx = mat2d.fromValues(1, 0, 0, 1, offsetX, -offsetY);
            const mtx = mat2d.fromValues(1, 0, 0, 1, layoutsh/2, layoutsv/2);
            // globalDPI x translateMtx x mtx x geoMtx

            mat2d.multiply(mtx, translateMtx, mtx);
            mat2d.invert(imtx, mtx);
            mat2d.multiply(imtx, imtx, translateMtxInvert);
            // mat2d.multiply(mtx, mtx, geoMtx);
            // widthDPI
            mat2d.multiply(mtx, globalCtx.DPIMat, mtx);
            // console.log(mtx);
            this.meta.originX = layoutsh/2;
            this.meta.originY = layoutsv/2;

            Object.assign(globalCtx.Coordinate.transformMeta, {
                transformMtx: mat2d.clone(mtx),
                // transformMtx: mat2d.create()
            });
        });

        effect(() => {
            const {
                x, y, deltaY, event
            } = globalCtx._mouse;
            // console.log('effect: '+ event)
            if(event === 'pointerdown') {
                // console.log('pointerdown');
                Object.assign(this.pin, {
                    trigger: true,
                    originX: x,
                    originY: y,
                    originMtx: globalCtx.Coordinate.transformMeta.transformMtx
                });
            }

            if(event === 'pointermove' && this.pin.trigger) {
                const {
                    originX,
                    originY,
                    originMtx
                } = this.pin;
                const offsetX = x - originX;
                const offsetY = y - originY;
                const dpr = globalCtx.DPR;

                const mtx = mat2d.fromValues(1,0,0,1,offsetX * dpr, offsetY * dpr);
                mat2d.multiply(mtx, mtx, originMtx);
                Object.assign(globalCtx.Coordinate.transformMeta, {
                    transformMtx: mtx,
                });
            }

            if(event === 'pointerup') {
                Object.assign(this.pin, {
                    trigger: false,
                });
            }

            if(event === 'wheel') {
                const originMtx = globalCtx.Coordinate.transformMeta.transformMtx;
                let zoom = this.pin.zoom;
                const dy = deltaY * -0.01;

                const nowZoom = zoom + dy;

                if(nowZoom < 2 && nowZoom > 0.5){
                    this.pin.zoom = nowZoom;
                    const scaler = 1 + dy;
                    // const vec = vec2.fromValues(x, y);
                    // vec2.transformMat2d(vec, vec, transformMtxRawInvert);
                    const dpr = globalCtx.DPR;
                    // // console.log(mouseVec);

                    const mtx = mat2d.fromValues(scaler, 0, 0, scaler, -x*dpr*dy, -y*dpr*dy);
                    mat2d.multiply(mtx, mtx, originMtx);
                    Object.assign(globalCtx.Coordinate.transformMeta, {
                        transformMtx: mtx,
                    });
                }

                // zoom += deltaY * -0.01;
                // zoom = Math.min(Math.max(.25, zoom), 2);
                // const mtx = mat2d.create();
                // mat2d.multiplyScalar(mtx, originMtx, zoom);
                // Object.assign(globalCtx.Coordinate.transformMeta, {
                //     transformMtx: mtx,
                // });
            }
        });




    }
}

export default Geo2D;