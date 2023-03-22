<template>
  <el-form-item
    label="更新策略"
  >
    <el-form-item style="display:flex;margin-bottom: 22px;" prop="spec.strategy.minReadySeconds">
      <template slot="label">
        最短就绪时间
        <el-tooltip effect="dark" content="最短就绪时间：新创建的副本准备就绪后，被视为可用前需要保持正常的时间下限，单位（秒）" placement="right" popper-class="ncs-el-tooltip-popper">
          <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
        </el-tooltip>
      </template>
      <el-input v-model="model.minReadySeconds" placeholder="请填入5-300的整数"/>
    </el-form-item>
    <el-form-item style="display:flex;margin-bottom: 22px;" prop="spec.strategy.maxSurge">
      <template slot="label">
        最大超预期副本数
        <el-tooltip effect="dark" content="最大超预期副本数：可创建的最大超过所需副本的副本数量或百分比" placement="right" popper-class="ncs-el-tooltip-popper">
          <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
        </el-tooltip>
      </template>
      <el-input v-model="model.maxSurge" placeholder="填写百分比或整数"/>
    </el-form-item>
    <el-form-item style="display:flex;margin-bottom: 22px;" prop="spec.strategy.maxUnavailable">
      <template slot="label">
        最大不可用副本数
        <el-tooltip effect="dark" content="最大不可用副本数：更新过程中不可使用的副本数上限个数或百分比" placement="right" popper-class="ncs-el-tooltip-popper">
          <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
        </el-tooltip>
      </template>
      <el-input v-model="model.maxUnavailable" placeholder="填写百分比或整数"/>
    </el-form-item>
  </el-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';

export default {
    mixins: [ makeVModelMixin ],

};
</script>

<style>

</style>
