<template>
  <el-form-item
    label="配置"
  >
    <el-form-item label="基础配置" style="margin-bottom: 22px;" label-width="120px">
      <el-select v-model="model.type">
        <el-option
          :value="0"
          label="0.1 Cores / 128 MiB"
        />
        <el-option
          :value="1"
          label="0.5 Cores / 512 MiB"
        />
        <el-option
          :value="2"
          label="1 Cores / 1024 MiB"
        />
        <el-option
          :value="-1"
          label="自定义"
        />
      </el-select>
    </el-form-item>
    <template v-if="model.type === -1">
      <el-form-item label="CPU" style="margin-bottom: 22px;" label-width="120px">
        <el-input-number v-model="model.cpu" controls-position="right" :min="0.001" style="width: 260px;" :step="0.1" :precision="3"/>
        <span style="margin-left:8px">Cores</span>
      </el-form-item>
      <el-form-item label="内存" style="margin-bottom: 22px;" label-width="120px">
        <el-input-number v-model="model.memory" controls-position="right" :min="1" style="width: 260px;" :step="128"/>
        <span style="margin-left:8px">MiB</span>
      </el-form-item>
    </template>
    <el-form-item label="配置上限" style="margin-bottom: 22px;" label-width="120px">
      <span style="margin-right:8px">基础配置 x</span>
      <el-input-number v-model="model.multiple" controls-position="right" :min="1" style="width: 260px;"/>
      <span style="margin-left:8px">{{ (model.cpu * model.multiple).toFixed(3) }}Cores / {{ model.memory * model.multiple }}MiB</span>
    </el-form-item>
    <el-form-item label="GPU 配置" style="margin-bottom: 22px;" label-width="120px">
      <el-input-number v-model="model.gpu" controls-position="right" :min="0" style="width: 260px;" :step-strictly="true" :step="1"/>
      <span style="margin-left:8px">颗</span>
    </el-form-item>
  </el-form-item>
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
