const HitTestPlugin = {
    apply(globalCtx) {
        const hitTestSpace = document.createElement('canvas');
        const hitTestSpaceCTX = hitTestSpace.getContext('2d');
        hitTestSpace.width = hitTestSpace.height = 1;
        globalCtx.hitTest = (x, y, draw) => {
            draw(hitTestSpaceCTX);
            const hit = hitTestSpaceCTX.getImageData(0, 0, 1, 1).data[3] > 1;
            // 回收像素，记得清空变换
            hitTestSpaceCTX.setTransform();
            hitTestSpaceCTX.clearRect(0, 0, 2, 2);
            return hit;
        };
    }
};

export default HitTestPlugin;