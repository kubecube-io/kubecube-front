<template>
    <div :class="$style.root" :style="{ width }">
        <slot>
            <u-linear-layout gap="none">
                <span :class="$style.value" :size="size">{{ currentValue }}</span>
                <span :class="$style.unit"> {{ currentUnit }}</span>
            </u-linear-layout>
            <p :class="$style.text">{{ currentText }}</p>
        </slot>
    </div>
</template>

<style module>
.root {
    display: inline-block;
    text-align: center;
}
.value {
    font-size: 30px;
    color: #5a6367;
}
.value[size="small"] {
    font-size: 24px;
}
.unit {
    color: #333;
}
 .text {
    margin: 0;
    color: #999;
}
</style>

<script>
import { Emitter } from 'cloud-ui.vusion';

export default {
    name: 'u-block-info-item',
    parentName: 'u-block-info',
    mixins: [Emitter],
    props: {
        size: { type: String, default: '' },
        text: { type: String, default: '' },
        unit: { type: String, default: '' },
        value: { type: [String, Number], default: '' },
    },
    data() {
        return {
            width: '', // 当前宽度百分比
            currentValue: this.value || '-',
            currentText: this.text || '-',
            currentUnit: this.unit,
        };
    },
    watch: {
        text(value) {
            value && (this.currentText = value);
        },
        unit(value) {
            value && (this.currentUnit = value);
        },
        value(value) {
            value && (this.currentValue = value);
        },
    },
    created() {
        this.dispatch(this.$options.parentName, 'add-item-vm', this);
        this.$nextTick(() => {
            this.width = this.$parent.width;
        });
    },
    destroyed() {
        this.$parent.remove(this);
    },
};
</script>

