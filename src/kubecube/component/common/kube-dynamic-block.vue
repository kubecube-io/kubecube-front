<template>
  <component
    :is="layout"
    :disabled="disabled"
    v-bind="$attrs"
    @add="add"
  >
    <component
      :is="columnComp"
      v-if="columnComp"
      slot="head"
      v-bind="$attrs"
      :disabled="disabled"
    >
      <slot name="column" />
    </component>
    <template
      v-for="(item, idx) in listLocal"
      slot="body"
    >
      <component
        :is="rowComp"
        v-bind="$attrs"
        :key="`${prefixKey}${idx}`"
        :index="idx"
        :value="item.value"
        :disabled="item.value.disabled || disabled"
        @remove="remove(item.key)"
      >
        <slot
          :model="item.value"
          :index="idx"
          :remove="() => { remove(item.key) }"
        />
        <template #errormessage>
          <slot :name="`${errormessage}-${idx}`" />
        </template>
      </component>
    </template>
  </component>
</template>

<script>
import tableLayout from './kube-dynamic-table-layout/index.vue';
import tableRow from './kube-dynamic-table-layout/row.vue';
import tableColumn from './kube-dynamic-table-layout/column.vue';
let uniqueKey = 0;
export default {
    model: {
        prop: 'list',
        event: 'listchange',
    },
    props: {
        list: {
            type: Array,
            default: () => ([]),
        },
        dataTemplate: {
            type: Function,
            default: () => ({}),
        },
        rowComp: {
            type: Object,
            default: () => tableRow,
        },
        layoutComp: {
            type: Object,
            default: () => tableLayout,
        },
        columnComp: {
            type: [ Object || null ],
            default: () => tableColumn,
        },
        initRequired: {
            type: Boolean,
            default: true,
        },
        disabled: Boolean,
        prefixKey: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            cache: {},
            unwatch: {},
        };
    },
    computed: {
        layout() {
            return this.layoutComp || 'div';
        },
        listLocal: {
            get() {
                return this.list.map(i => this.watchItem(i));
            },
            set(value) {
                this.$emit('listchange', value.map(v => v.value));
            },
        },
    },
    watch: {
        listLocal(val) {
            if (this.initRequired && val.length === 0) {
                this.add();
            }
        },
    },
    created() {
        if (this.initRequired && this.listLocal.length === 0) {
            this.add();
        }
        // if (this.listLocal.length > 0) {
        //     this.listLocal = this.listLocal.map(i => this.watchItem(i));
        // }
    },
    methods: {
        watchItem(target) {
            for (const key in this.cache) {
                const v = this.cache[key];
                if (v.value === target) return v;
            }
            const key = uniqueKey++;
            target = {
                key,
                value: target,
            };
            this.$set(this.cache, key, target);
            // this.unwatch[key] = this.$watch(() => target,
            //     val => {
            //         this.change(key, val);
            //     }, {
            //         deep: true,
            //     });
            return target;
        },
        add() {
            const target = this.watchItem(this.dataTemplate());
            this.listLocal = this.listLocal.concat([ target ]);
        },
        remove(key) {
            const index = this.listLocal.findIndex(i => i.key === key);
            let list = this.listLocal.slice(0, index).concat(this.listLocal.slice(index + 1));
            // this.unwatch[key]();
            if (this.initRequired && list.length === 0) {
                list = [ this.watchItem(this.dataTemplate()) ];
            }
            this.listLocal = list;
        },
        // change(key, value) {
        //     console.log('change')
        //     const index = this.listLocal.findIndex(i => i.key === key);
        //     const newVal = value;
        //     const list = this.listLocal.slice();
        //     list[index] = newVal;
        //     this.listLocal = list;
        // },
    },
};
</script>

<style module>

</style>
