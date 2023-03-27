<template>
  <el-dialog
    title="设置污点"
    :visible.sync="show"
    width="640px"
    @close="close"
  >
    <div>污点（taint），只有拥有和 taint 相匹配的 toleration 的 pod 才能够被分配到节点。</div>
    <el-form v-if="show" ref="form" :model="model" label-position="right">
      <el-form-item>
        <dynamicBlock
          v-model="model.taints"
          :getDefaultItem="getDataTemplate"
          :columns="[
              {
                  title: 'Key',
                  dataIndex: 'key',
              },
              {
                  title: 'Value',
                  dataIndex: 'value',
              },
              {
                  title: 'Effect',
                  dataIndex: 'effect',
              }
          ]"
        >
          <template slot="th-effect">
            Effect
            <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
              <template slot="content">
                <div>NoSchedule：POD 不会被调度到标记为 taints 节点。</div>
                <div>PreferNoSchedule：NoSchedule 的软策略版本。尽量避免将 pod 调度到存在其不能容忍 taint 的节点上</div>
                <div>NoExecute：该选项意味着一旦 Taint 生效，如该节点内正在运行的 POD 没有对应 Tolerate 设置，会直接被逐出。</div>
              </template>
              <i class="el-icon-question"/>
            </el-tooltip>
          </template>

          <template v-slot:key="{record, index}">
            <el-form-item 
              label=""
              :prop="`taints.${index}.key`"
              :rules="[
                validators.keyPattern(false),
                validators.noRedundance(exsitKeys, false),
              ]"
            >
              <el-input
                v-model="record.key"
              />
            </el-form-item>
          </template>
          <template v-slot:value="{record, index}">
              <el-input
                v-model="record.value"
              />
          </template>
          <template v-slot:effect="{record, index}">
            <el-select
              v-model="record.effect"
              placeholder="请选择"
              filterable
            >
              <el-option
                v-for="item in effects"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </template>
        </dynamicBlock>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit" :loading="submitLoading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { get, cloneDeep, set } from 'lodash';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubecube/services/k8s-resource';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ Modal ],
    props: {
        instance: Object,
    },
    data() {
        return {
            effects: [ 'NoSchedule', 'PreferNoSchedule', 'NoExecute' ].map(item => ({ text: item, value: item })),
            model: {
                taints: [],
            },
            test: [],
            raw: null,
            validators,
            submitLoading: false,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.taints.map(t => t.key);
        },
    },
    methods: {
        open(item) {
            const taints = get(item, 'spec.taints', []);
            this.model.taints = cloneDeep(taints);
            this.raw = item;
            this.show = true;
        },
        getDataTemplate() {
            return {
                key: '',
                value: '',
                effect: 'NoSchedule',
            };
        },
        async submit() {
            // 触发校验
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.submitLoading = true;
            try {
                const data = await workloadService.getResourceWithoutNamespace({
                    pathParams: {
                        cluster: this.instance.clusterName,
                        resource: 'nodes',
                        name: get(this.raw, 'metadata.name'),
                    },
                });
                set(data, 'spec.taints', this.model.taints.filter(item => item.key && item.value));
                await workloadService.updateResourceWithoutNamespace({
                    pathParams: {
                        cluster: this.instance.clusterName,
                        resource: 'nodes',
                        name: get(this.raw, 'metadata.name'),
                    },
                    data,
                });
                this.show = false;
                this.$emit('refresh');
            } catch (error) {
                console.log(error);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style>

</style>
