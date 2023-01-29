<template>
    <div style="display:flex">
        <el-input
            v-model="hostPrefix"
            :color="errors && errors[0] ? 'error' : ''"
        />
        <span style="margin:0 4px">.</span>
        <el-select
            v-model="domainSuffix"
            filterable
        >   
            <el-option
                v-for="item in domainSuffixList"
                :key="item.value"
                :label="item.text"
                :value="item.value"
                :title="item.text"
            />
        </el-select>
        <span style="margin:0 4px"> :{{ port }}</span>
    </div>
</template>
<script>
export default {
    props: {
        value: String,
        domainSuffixList: Array,
        port: Number,
        errors: Array,
    },
    data() {
        return {
            hostPrefix: '',
            domainSuffix: '',
        };
    },
    computed: {
        hostAddress() {
            return `${this.hostPrefix}${this.domainSuffix ? '.' + this.domainSuffix : ''}`;
        },
    },
    watch: {
        domainSuffixList() {
            this.resolveHost();
        },
        hostAddress(val) {
            this.$emit('change', val);
            this.$emit('input', val);
        },
    },
    mounted() {
        this.resolveHost();
    },
    methods: {
        resolveHost() {
            const suffix = this.domainSuffixList.find(item => this.value.endsWith(item.value));
            if (suffix) {
                this.hostPrefix = this.value.substring(0, this.value.length - suffix.value.length - 1);
                this.domainSuffix = suffix.value;
            } else {
                this.hostPrefix = this.value;
                this.domainSuffix = '';
            }
        },
    },
};
</script>
