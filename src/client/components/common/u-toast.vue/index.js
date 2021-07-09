import Vue from 'vue';

const Toast = {
    name: 'u-toast',
    props: {
        position: { type: String, default: 'top-right' },
        single: { type: Boolean, default: false },
        duration: { type: Number, default: 2000 },
        color: { type: String, default: 'default' },
        text: String,
    },
    data() {
        return {
            items: [],
        };
    },
    mounted() {
        if (this.position !== 'static')
            document.body.appendChild(this.$el);
    },
    methods: {
        show(text, duration, type, position) {
            if (!this.items[this.items.length])
                this.$mount(document.createElement('div'));

            this.open({
                text: text || this.text,
                type: type || 'info',
                position: position || this.position,
                duration: duration === undefined ? this.duration : duration,
            }, this.items.length);
        },
        open(options) {
            this.items.unshift(options);
            this.items.forEach((item, index) => {
                if (!item || item.position.includes('top-'))
                    item.top = index * 100 + 90;
                else if (item.position.includes('bottom-'))
                    item.bottom = index * 100 + 30;
                this.items.splice(index, 1, item);
            });
            const item = this.items[0];

            if (item.duration) {
                setTimeout(() => {
                    if (!item.counter)
                        this.close(item);
                    else
                        item.counter--;
                }, item.duration);
            }

            this.$emit('open', item);
        },
        close(item) {
            let cancel = false;
            this.$emit('before-close', Object.assign({
                preventDefault: () => cancel = true,
            }, item));
            if (cancel)
                return;

            const index = this.items.indexOf(item);
            ~index && this.items.splice(index, 1);

            this.$emit('close', item);
        },
        /**
         * @method closeAll() 关闭所有消息
         * @return {void}
         */
        closeAll() {
            this.items = [];
        },
        success(message, duration, position) {
            this.show(message, duration, 'success', position);
        },
        warning(message, duration, position) {
            this.show(message, duration, 'warning', position);
        },
        info(message, duration, position) {
            this.show(message, duration, 'info', position);
        },
        error(message, duration, position) {
            this.show(message, duration, 'error', position);
        },
    },
};

Vue.nextTick(() => {
    const Ctor = Vue.component('u-toast');
    if (!Ctor)
        return;

    Vue.prototype.$toast = Toast.toast = new Ctor();

    const METHODS = ['show', 'closeAll', 'success', 'warning', 'info', 'error'];
    METHODS.forEach((method) => Toast[method] = Toast.toast[method].bind(Toast.toast));
});

export default Toast;
