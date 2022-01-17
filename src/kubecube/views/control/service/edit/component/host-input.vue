<template>
  <div>
    <u-input
      v-model="hostPrefix"
      size="normal medium"
      :color="errors && errors[0] ? 'error' : ''"
    />
    <u-text> . </u-text>
    <u-suggest
      v-model="domainSuffix"
      :data="domainSuffixList"
    />
    <u-text> :{{ port }}</u-text>
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
