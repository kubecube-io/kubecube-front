<template>
    <div :class="$style.root">
        <textarea :disabled="disabled" :class="['u-textarea', isError ? 'err': '' ]" v-model="value" :placeholder="placeholder" ></textarea>
        <span v-show="isError" class="message" :color="isError ? 'error' : ''" style="vertical-align: top;">{{errMessage}}</span>
    </div>
</template>

<script>
export default {
    name: 'u-textarea-config',
    props: {
        disabled: { type: Boolean, default: false },
        values: { type: [ Array, String ], default: '' }, // 可能是处理后的数组，也可能是输入的内容的字符串
        max: { type: Number, default: 1024 },
        errMessage: String,
        placeholder: String,
    },
    data() {
        // 关闭打开之后，会重新走一遍这里，watch对应的values数据无法触发，所以这里必须要初始化一次，和watch的回调相同
        return {
            value: this.initValue(this.values),
        };
    },
    computed: {
        isError () {
            return this.value.replace(/[\n\r]/g, '').length > this.max;
        },
    },
    watch: {
        values(value) {
            this.value = this.initValue(value);
        },
        value(value) {
            this.$emit('change', {
                isError: this.isError,
                value: this.value,
            });
        },
    },
    methods: {
        initValue(value) {
            return (typeof value === 'string') ? value : value.join('\r');
        },
        $getData(value = '') {
            value = this.initValue(value) || this.value;
            const tmp = value.trim().split(/[\r\n]+/).filter((item) => item);
            let ret = [];
            tmp.forEach((item, i, arr) => {
                const index = (ret.length - 1 < 0) ? 0 : (ret.length - 1); 
                if((ret[index] || '').trim().endsWith('\\'))
                    ret[index] = ret[index] + '\n' + item.trim();
                else
                    ret.push(item);
            })
            return ret;
        },
    },
}
</script>

<style module>
.root {
    position: relative;
    width: 580px;
}
</style>


<style>
    textarea {
        resize: vertical;
        outline: 0;
        font-size: 100%;
        margin: 0;
        vertical-align: baseline;
        vertical-align: middle;
    }
    .u-textarea{
        box-sizing: border-box;
        width: 100%;
        height: 120px; padding: 5px 10px;
        border: 1px solid #e1e8ed;
        vertical-align: middle;
        font-size: 14px;
        line-height: 22px;
        color: #666;
        transition: border-color 0.2s;
        &:hover{ border-color: #cad0d5;}
        &:focus{ border-color: #8ebee9;}
        &.err{ border-color: #ff877f !important;}
        &.js-invalid{ border: 1px solid #ff867f !important;}
        &:disabled{ background-color: #e9f0f5; cursor: not-allowed;}
    }
    .message {
        position: absolute;
        display: inline-block;
        margin-left: 10px;
        padding: 0 10px;
        line-height: 26px;
        height: 26px;
        font-size: 12px;
        white-space: nowrap;
    }
    .message:after {
        content: "";
        position: absolute;
        right: 100%;
        top: 8px;
        width: 0;
        height: 0;
        border-top: 4px solid transparent;
        border-right: 4px solid #ff867f;
        border-bottom: 4px solid transparent;
    }

    .message[color="error"] {
        background-color: #ff867f;
        color: #fff;
    }
</style>

