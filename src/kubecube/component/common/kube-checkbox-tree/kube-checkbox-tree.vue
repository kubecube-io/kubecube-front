<template>
  <div :class="$style.root">
    <div :class="$style.line">
      <u-checkbox
        v-model="currentState"
        :disabled="disabled"
      />
      <u-text>{{ currLevelText }}</u-text>
    </div>
    <div :class="$style.nextLevel">
      <template v-for="k in keys">
        <kube-checkbox-tree
          :key="k"
          :disabled="disabled"
          :data="data[k]"
          :curr-level-text="k"
          :data-key="`${dataKey ? `${dataKey}.` : ''}${k}`"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { isObject } from 'lodash';
import { traverse } from './utils';
export default {
    name: 'KubeCheckboxTree',
    inject: [ 'emitStateChange' ],
    props: {
        data: [ Object, Boolean ],
        currLevelText: String,
        dataKey: {
            type: String,
            default: '',
        },
        disabled: Boolean,
    },
    computed: {
        keys() {
            return Object.keys(this.data);
        },
        currentState: {
            get() {
                if (isObject(this.data)) {
                    let state = true;
                    traverse(this.data, (key, value) => {
                        if (!value) {
                            state = false;
                            return false;
                        }
                        return true;
                    });
                    return state;
                }
                return this.data;
            },
            set(val) {
                this.emitStateChange({
                    key: this.dataKey,
                    value: val,
                });
            },
        },
    },
};
</script>

<style module>
.nextLevel{
    padding-left: 20px;
}
</style>
