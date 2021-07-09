import Vue from 'vue';
import licenseService from '@micro-app/common/services/license';
import config from '@micro-app/common/utils/config';

const Toast = {
    show() {},
};

Vue.nextTick(() => {
    const Ctor = Vue.component('u-toast');
    if (!Ctor)
        return;

    const $toast = new Ctor();

    $toast.single = true;
    $toast.position = 'top-right';
    $toast.closable = true;

    Toast.show = function(text, duration = 3000) {
        // $toast.show(text, duration);
        $toast.warning(text, duration);
    };
});

export default Object.assign({
    check: function() {
        licenseService.status().then((status = {}) => {
            if (!status) return;
            if (status.modules_usage) { // for v2
                const cloneStatus = JSON.parse(JSON.stringify(status));
                delete cloneStatus.expired; // 不用
                delete cloneStatus.usage; // 不用
                const modules_usage = status.modules_usage;
                delete cloneStatus.modules_usage; // 不用
                if (Object.keys(cloneStatus).some(key => !!cloneStatus[key])) { // 全局异常
                    Toast.show('License 异常，请联系平台管理员', 1000 * 6);
                } else { // 模块异常
                    const currentModule = config.getCurrModule();
                    if (currentModule) {
                        if (modules_usage[currentModule.key]) {
                            Toast.show(`License 异常，请联系平台管理员`, 1000 * 6);
                        }
                    }
                }
            } else if (Object.keys(status).some(key => !!status[key])) { // for v1
                Toast.show('License 异常，请联系平台管理员', 1000 * 6);
            }
        });
    }
}, Toast);
