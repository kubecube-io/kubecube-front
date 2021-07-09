<template>
  <component
    :is="component"
    v-bind="$attrs"
  >
    <slot
      :data="currValue"
      :onchange="changeCurrentValue"
    />
  </component>
</template>

<script>
export default {
    name: 'XScope',
    props: {
        initValue: [ String, Number, Object, Array ],
        component: {
            type: [ String, Object ],
            default: 'div',
        },
    },
    data() {
        return {
            currValue: undefined,
        };
    },
    watch: {
        initValue(val) {
            this.currValue = val;
        },
    },
    created() {
        this.currValue = this.initValue;
    },
    methods: {
        changeCurrentValue(value) {
            const a = JSON.stringify(value);
            const b = JSON.stringify(this.currValue);
            if (a !== b) { this.currValue = value; }
        },
    },

};
</script>

<style>

</style>
