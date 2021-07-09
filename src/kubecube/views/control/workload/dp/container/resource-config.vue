<template>
  <kube-form-item
    label="配置"
    layout="block"
  >
    <kube-form label-size="normal">
      <kube-form-item label="基础配置">
        <u-select
          v-model="model.type"
          size="large huge"
          :class="$style.select"
        >
          <u-select-item :value="0">
            0.1 Cores / 128 MiB
          </u-select-item>
          <u-select-item :value="1">
            0.5 Cores / 512 MiB
          </u-select-item>
          <u-select-item :value="2">
            1 Cores / 1024 MiB
          </u-select-item>
          <u-select-item :value="-1">
            自定义
          </u-select-item>
        </u-select>
      </kube-form-item>
      <template v-if="model.type === -1">
        <kube-form-item label="CPU">
          <u-number-input
            v-model="model.cpu"
            size="huge normal"
            :min="0.001"
            :step="0.1"
            :precision="0.001"
          /> Cores
        </kube-form-item>
        <kube-form-item label="内存">
          <u-number-input
            v-model="model.memory"
            size="huge normal"
            :min="1"
            :step="128"
          /> MiB
        </kube-form-item>
      </template>
      <kube-form-item label="配置上限">
        基础配置 x <u-number-input
          v-model="model.multiple"
          size="huge normal"
          :min="1"
        />
        {{ (model.cpu * model.multiple).toFixed(3) }}Cores / {{ model.memory * model.multiple }}MiB
      </kube-form-item>
      <kube-form-item label="GPU 配置">
        <u-number-input
          v-model="model.gpu"
          size="huge normal"
          :min="0"
        /> 颗
      </kube-form-item>
    </kube-form>
  </kube-form-item>
</template>

<script>
import { RESOURCE_REQUEST_MAP } from 'kubecube/utils/constance';
const configs = RESOURCE_REQUEST_MAP.map(({ cpu, memory }, idx) => ({
    text: `${cpu} Cores / ${memory} MiB`,
    value: idx,
    config: { cpu, memory },
}));
configs.push({ text: 'Customize', value: -1 });
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
export default {
    mixins: [ makeVModelMixin ],
    watch: {
        'model.type': function(val) {
            if (val !== -1) {
                const c = configs.find(c => c.value === val);
                Object.assign(this.model, c.config);
            }
        },
    },
};
</script>

<style module>
.root {
    margin-top: -5px;
}
.title {
    display: inline-block;
    padding: 20px 0 5px;
}
.wrap {
    margin-top: 20px;
}
.select[class] {
    width: 460px;
}
.customItem {
    margin-bottom: 10px;
}
</style>
