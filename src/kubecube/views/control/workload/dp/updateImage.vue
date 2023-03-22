<template>
  <div>
    <el-form
      ref="form"
      :model="instance"
      label-position="right"
      label-width="160px"
    >
      <div :class="$style.title">基本信息</div>
      <table :class="$style.table">
        <thead>
          <tr>
            <th width="200px">容器名称</th><th width="600px">容器镜像</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(container, index) in instance.containers" :key="index" style="padding-bottom:8px">
            <td style="padding: 0 0 20px;" :title="container.containerName" :class="$style.eclipse">{{ container.containerName || '-' }}</td>
            <td style="padding: 0 0 20px;">
              <div style="display:flex">
                <el-form-item
                  label-width="0px"
                  style="margin-bottom:0"
                  label=""
                  :prop="`containers.${index}.image`"
                  :rules="[
                    validators.required(),
                  ]"
                >
                  <el-input v-model="container.image" placeholder="请输入" style="width:450px"/>
                </el-form-item>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div :class="$style.title" style="margin-bottom:20px">更新策略</div>
      <el-form-item
        prop="spec.strategy.minReadySeconds"
        :rules="[
          validators.consistofNumber(false),
          validators.numberBetween(5, 300, false),
        ]"
      >
        <template slot="label">
          最短就绪时间
          <el-tooltip effect="dark" content="最短就绪时间：新创建的副本准备就绪后，被视为可用前需要保持正常的时间下限，单位（秒）" placement="right" popper-class="ncs-el-tooltip-popper">
            <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
          </el-tooltip>
        </template>
        <el-input :disabled="!hasImageChange" v-model="instance.spec.strategy.minReadySeconds" placeholder="请填入5-300的整数"/>
      </el-form-item>
      <el-form-item 
        prop="spec.strategy.maxSurge"
        :rules="[
          validators.consistofNumberOrPercentage(false)
        ]"
      >
        <template slot="label">
          最大超预期副本数
          <el-tooltip effect="dark" content="最大超预期副本数：可创建的最大超过所需副本的副本数量或百分比" placement="right" popper-class="ncs-el-tooltip-popper">
            <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
          </el-tooltip>
        </template>
        <el-input :disabled="!hasImageChange" v-model="instance.spec.strategy.maxSurge" placeholder="填写百分比或整数"/>
      </el-form-item>
      <el-form-item
        prop="spec.strategy.maxUnavailable"
        :rules="[
          validators.consistofNumberOrPercentage(false),
        ]"
      >
        <template slot="label">
          最大不可用副本数
          <el-tooltip effect="dark" content="最大不可用副本数：更新过程中不可使用的副本数上限个数或百分比" placement="right" popper-class="ncs-el-tooltip-popper">
            <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
          </el-tooltip>
        </template>
        <el-input :disabled="!hasImageChange" v-model="instance.spec.strategy.maxUnavailable" placeholder="填写百分比或整数"/>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!hasImageChange" type="primary" @click="submit" :loading="commitLoading">更新</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { get as getFunc } from 'lodash';
import { get, sync } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toModifyK8SObject as toModifyDeploymentK8SObject,
} from 'kubecube/k8s-resources/deployment/index.js';
import * as validators from 'kubecube/utils/validators';
export default {
    props: {
        instance: Object,
    },
    data() {
        return {
            validators,
            oldImages: this.instance.containers.map(item => item.image),
            containers: [],
            currentContainerModel: null,
            showSelectImageModal: false,
            minReadySeconds: '',
            maxSurge: '',
            maxUnavailable: '',
            commitLoading: false,
        };
    },
    computed: {
        cluster: get('scope/cluster@value'),
        namespace: get('scope/namespace@value'),
        tenant: sync('scope/tenant@value'),
        project: sync('scope/project@value'),
        clusterHarborAddr: get('scope/cluster@harborAddr'),
        hasImageChange() {
            const newIamges = this.instance.containers.map(item => item.image);
            return JSON.stringify(this.oldImages) !== JSON.stringify(newIamges);
        },
    },
    created() {
        console.log(this.instance);
    },
    methods: {
        openSelectImageModal(containerModel) {
            this.currentContainerModel = containerModel;
            this.showSelectImageModal = true;
        },
        changeCurrentContainerModelImage(val) {
            this.currentContainerModel.image = val;
        },
        async submit() {
            // 触发校验
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            try {
                this.commitLoading = true;
                const instance = await workloadService.getInstance({
                    pathParams: {
                        namespace: this.namespace,
                        cluster: this.cluster,
                        resource: 'deployments',
                        name: this.instance.metadata.name,
                    },
                });
                this.instance.puresource = instance;
                const yaml = toModifyDeploymentK8SObject(this.instance);
                await workloadService.modifyWorkload({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'deployments',
                        name: yaml.metadata.name,
                    },
                    data: yaml,
                    noAlert: true,
                });
                this.$router.push({ path: '/control/deployments/list' });
            } catch (err) {
                this.$globalErrorModal(getFunc(err, 'details.causes[0]') || err);
            }
            this.commitLoading = false;
        },
    },
};
</script>
<style module>
.wrap {
    margin-bottom: 20px;
}
.table {
    margin-left: 20px;
    width: 800px!important;
}
.table th {
  font-weight: normal;
  line-height: 48px;
  text-align: left;
}
.eclipse {
  max-width: 200px;
  padding: 0 0 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.formItem[class] {
    margin-bottom: 30px !important;
}
.name {
    display: inline-block;
    width: 95px;
    vertical-align: middle;
}
.title {
    box-sizing: content-box;
    padding: 6px 20px;
    margin: 0;
    height: 30px;
    line-height: 30px;
    color: #333;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e1e8ed;
}
.selectImageBtn {
  white-space: nowrap;
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 8px;
  line-height: 32px;
}
</style>
