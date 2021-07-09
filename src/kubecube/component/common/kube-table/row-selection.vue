<template>
  <div :class="$style.root">
    <u-checkbox
      v-model="state"
      @check="toggle($event.value)"
    />
  </div>
</template>

<script>
import { get } from 'lodash';
export default {
    props: {
        itemKey: String,
        data: Object,
        column: Object,
        columnMeta: Object,
    },
    data() {
        return {
            state: false,
        };
    },
    computed: {
        currKey() {
            return this.itemKey ? get(this.data, this.itemKey, '') : this.data;
        },
    },
    mounted() {
        const states = this.columnMeta.__tablemeta__.states;
        if (states.includes(this.currKey)) {
            this.state = true;
        }
        this.$watch(() => this.columnMeta.__tablemeta__.states, val => {
            if (val.includes(this.currKey)) {
                this.state = true;
            } else {
                this.state = false;
            }
        });
    },
    methods: {
        toggle(checked) {
            this.setData(checked);
        },
        setData(checked) {
            const cache = this.columnMeta.__tablemeta__.states;
            const p = cache.findIndex(c => c === this.currKey);
            if (checked && p === -1) {
                cache.push(this.currKey);
            }
            if (!checked && p > -1) {
                cache.splice(p, 1);
            }
        },
    },
};
</script>

<style module>
.root{
    padding-left: 10px;
}
</style>
