<template>
  <div>
    <el-form-item
      label="任务设定"
    >
      <el-form-item
        label=""
        style="display:flex;margin-bottom: 22px;"
      >
        <!-- <div style="color: #999;">任务达到执行完成状态需要成功执行的 Pod 数量</div> -->
        <template slot="label">
          预期成功执行数
          <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
            <div slot="content">
              任务达到执行完成状态需要成功执行的 Pod 数量
            </div>
            <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
          </el-tooltip>
        </template>
        <el-input-number
          v-model="model.completions"
          controls-position="right" 
          :min="1" 
          style="width: 300px;"
          :step-strictly="true"
        />
      </el-form-item>
      <el-form-item
        label=""
        style="display:flex;margin-bottom: 22px;"
      >
        <!-- <div style="color: #999;">任务执行过程中允许同时创建的最大 Pod 数,并行数应不大于执行次数</div> -->
        <template slot="label">
          并行数
          <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
            <div slot="content">
              任务执行过程中允许同时创建的最大 Pod 数,并行数应不大于执行次数
            </div>
            <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
          </el-tooltip>
        </template>
        <el-input-number
          v-model="model.parallelism"
          controls-position="right" 
          :min="1"
          style="width: 300px;"
          :step-strictly="true"
        />
      </el-form-item>
      <el-form-item
        label=""
        style="display:flex;margin-bottom: 22px;"
        :prop="`${prefixProp}.activeDeadlineSeconds`"
        :rules="[
          validators.consistofNumber(false),
        ]"
      >
        <!-- <div style="color: #999;">任务执行超出该时间时，任务将会被标识为执行失败，任务负载下的所有 Pod 实例都会被删除。为空时表示不设置超时时间。</div> -->
        <template slot="label">
          超时时间
          <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
            <div slot="content">
              任务执行超出该时间时，任务将会被标识为执行失败，任务负载下的所有 Pod 实例都会被删除。为空时表示不设置超时时间。
            </div>
            <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
          </el-tooltip>
        </template>
        <el-input v-model="model.activeDeadlineSeconds" style="width: 300px;"/>
        <span style="margin-left:8px">秒</span>
      </el-form-item>
      <el-form-item
        label="重试次数"
        style="margin-bottom:22px"
      >
        <el-input-number
          v-model="model.backoffLimit"
          controls-position="right"
          :min="1"
          style="width: 300px;"
          :step-strictly="true"
        />
      </el-form-item>
    </el-form-item>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            validators,
        };
    },
};
</script>

<style>

</style>
