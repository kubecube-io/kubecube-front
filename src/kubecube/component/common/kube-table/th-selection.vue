<template>
  <th>
    <div :class="$style.root">
      <u-checkbox
        v-model="state"
        @check="checkAll($event.value)"
      />
    </div>
  </th>
</template>

<script>
import { get } from 'lodash';
export default {
    inject: [ 'registEvent' ],
    props: {
        itemKey: String,
        column: Object,
        rows: Array,
        columnMeta: Object,
    },
    data() {
        return {
            state: false,
        };
    },
    mounted() {
        this.setStates([]);
        this.$watch(() => this.rows, val => {
            const rowKeys = val.map(v => get(v, this.itemKey));
            const states = this.columnMeta.__tablemeta__.states;
            const allSelect = rowKeys.every(key => states.find(k => k === key));
            if (allSelect) {
                this.state = true;
            } else {
                this.state = false;
            }
        });
        this.$watch(() => this.columnMeta.__tablemeta__.states, val => {
            if (!val) {
                this.setStates([]);
            } else {
                if (val.length === this.rows.length) {
                    this.state = true;
                } else {
                    this.state = false;
                }
            }

        });
        this.registEvent('selection:change',
            () => this.columnMeta.__tablemeta__.states,
            (states, items) => {
                const p = [];
                const key = this.itemKey;
                items.forEach(i => {
                    if (states.includes(get(i, key))) {
                        p.push(i);
                    }
                });
                return p;
            });
    },
    methods: {
        getItem(d) {
            return this.itemKey ? get(d, this.itemKey, '') : d;
        },
        setStates(val) {
            this.$set(this.columnMeta.__tablemeta__, 'states', val);
        },
        checkAll(checked) {
            if (!checked) {
                this.setStates([]);
            } else {
                this.setStates(this.rows.slice().map(this.getItem));
            }
            // this.columnMeta.__tablemeta__.states.for(h => ({ ...h, checked }));
        },
    },
};
</script>

<style module>
.root {
    padding-left: 10px;
    color: #999;
}
</style>
