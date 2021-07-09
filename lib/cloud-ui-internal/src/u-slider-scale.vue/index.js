import { Slider } from 'cloud-ui.vusion';

export default {
    name: 'u-slider-scale',
    mixins: [Slider],
    watch: {
        value(value) {
            this.currentValue = value;
            this.handleEl.style.top = this.percent + '%';
        },
    },
    computed: {
        percent: {
            get() {
                return 100 - (this.currentValue - this.min) / (this.max - this.min) * 100;
            },
            set(percent) {
                const value = this.fix(+this.min + (this.max - this.min) * percent / 100);
                this.currentValue = value;
                this.$emit('input', value);
                this.$emit('update:value', value);
            },
        },
    },
    mounted() {
        this.handleEl = this.$refs.handle;
        this.handleEl.style.top = this.percent + '%';
        this.handleEl.style.left = '0';
    },
    methods: {
        onDragStart($event) {
            this.grid.y = this.step / (this.max - this.min) * $event.range.height;
            const oldValue = this.currentValue;
            this.percent = ($event.range.height - $event.top) / $event.range.height * 100;
            const percent = this.percent;
            this.handleEl.style.top = percent + '%';
            this.$emit('slide', {
                oldValue,
                value: this.currentValue,
                percent,
            });
        },
        onDrag($event) {
            const percent = ($event.range.height - $event.top) / $event.range.height * 100;
            this.setPrecent(percent);
        },
        plusValue() {
            const percent = 100 - this.percent;
            if (percent >= 100)
                return;
            this.setPrecent(percent + 10);
        },
        minusValue() {
            const percent = 100 - this.percent;
            if (percent <= 0)
                return;
            this.setPrecent(percent - 10);
        },
        setPrecent(value) {
            const oldValue = this.currentValue;
            this.percent = value;
            this.handleEl.style.top = this.percent + '%';
            this.$emit('slide', {
                oldValue,
                value: this.currentValue,
                percent: this.percent,
            });
        },
    },
};

