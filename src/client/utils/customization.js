const config = {
    init() {
        if (window && window.MicroApp) {
            this._customizationConfig = window.MicroApp.get('customization');
            if (this._customizationConfig) {
                Object.keys(this._customizationConfig).forEach((key) => {
                    if (/Switch$/g.test(key)) { // 开关统一规整
                        this[key] = this._customizationConfig[key] === 'open';
                    } else {
                        this[key] = this._customizationConfig[key];
                    }
                });
            }
        }
    },
    get() {
        this.init(); // refresh
        return this._customizationConfig || {};
    },
};

config.init();

export default config;
