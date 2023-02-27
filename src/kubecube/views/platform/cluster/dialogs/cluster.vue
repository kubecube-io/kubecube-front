<template>
  <div>
    <el-dialog
      :title="isEdit ? '修改集群': '添加集群'"
      :visible.sync="show"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        v-if="show"
        ref="form"
        :model="model"
        label-position="right"
        label-width="120px"
      >
        <el-form-item
          label="集群名称"
          prop="clusterDisplayName"
          :rules="[
            validators.required(),
            validators.clusterDisplayName(),
          ]"
        >
          <el-input
            v-model="model.clusterDisplayName"
            disabeld
            placeholder="1-100字符，以中文、字母、数字开头或结尾，支持下划线、中划线"
          />
        </el-form-item>
        <el-form-item
          label="集群标识"
          prop="clusterName"
          :rules="[
            validators.required(),
            validators.k8sResourceNameValidator(),
          ]"
        >
          <el-input
            v-model="model.clusterName"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
          :rules="[
            validators.lengthBetween(0, 128)
          ]"
        >
          <el-input
            v-model="model.description"
            placeholder="128字符以内"
          />
        </el-form-item>
        <el-form-item
          v-if="!isEdit"
          label="KubeConfig"
          prop="kubeConfig"
          :rules="[
            validators.required(),
          ]"
        >
          <div style="display:flex">
            <el-input
              v-model="model.kubeConfig"
              style="margin-right:10px"
              disabled
            />
            <u-uploader
              style="width: 80px"
              max-size="1MB"
              @before-send="onUpload($event)"
              @error="uploadError($event)"
            >
              <el-link type="primary">
                选择文件
              </el-link>
            </u-uploader>
          </div>
        </el-form-item>
        <el-form-item
          label="网络类型"
          prop="networkType"
          :rules="[
            validators.required(),
            validators.trimRequired(),
          ]"
        >
          <div style="display:flex">
            <el-input
              v-if="otherNetworkType"
              v-model="model.networkType"
              placeholder="请输入"
            />
            <el-select
              v-else
              v-model="model.networkType"
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="item in networkTypes"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
            <el-checkbox
              v-model="otherNetworkType"
              style="margin-left: 8px"
            >
              其他
            </el-checkbox>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="close">
          取 消
        </el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="submit"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
    <!-- <u-modal
      :title=" isEdit ? '修改集群': '添加集群' "
      ok-button=""
      cancel-button=""
      :visible.sync="show"
      size="large"
      @close="close"
    >
      <validation-observer
        ref="observer"
        v-slot="{ invalid }"
      >
        <kube-form>
          <kube-name-input
            v-model="model.clusterName"
            :disabled="isEdit"
          />
          <kube-form-item
            label="描述"
          >
            <u-input
              v-model="model.description"
              size="large"
              maxlength="128"
              maxlength-message="128字符以内"
              placeholder="128字符以内"
            />
          </kube-form-item>

          <validation-provider
            v-slot="{ errors }"
            name="storage"
            rules="required"
          >
            <kube-form-item
              :message="uploadErrorMsg || (errors && errors[0])"
              label="KubeConfig"
              required
            >
              <div style="display:flex;align-items: center;">
                <u-input
                  v-model="model.kubeConfig"
                  :color="(uploadErrorMsg || (errors && errors[0])) ? 'error' : ''"
                  size="large"
                  style="width: 350px;margin-right:10px"
                  readonly
                />
                <u-uploader
                  style="width: 80px"
                  max-size="1MB"
                  @before-send="onUpload($event)"
                  @error="uploadError($event)"
                >
                  <u-link>选择文件</u-link>
                </u-uploader>
              </div>
            </kube-form-item>
          </validation-provider>

          <validation-provider
            v-slot="{ errors }"
            name="storage"
            rules="required"
          >
            <kube-form-item
              :message="uploadErrorMsg || (errors && errors[0])"
              label="网络类型"
              required
            >
              <u-linear-layout
                type="flex"
                alignment="center"
              >
                <u-input
                  v-if="otherNetworkType"
                  v-model="model.networkType"
                  size="large"
                />
                <u-select
                  v-else
                  v-model="model.networkType"
                  :data="networkTypes"
                  size="large"
                />
                <u-checkbox
                  v-model="otherNetworkType"
                  style="width: 80px"
                >其他</u-checkbox>
              </u-linear-layout>
            </kube-form-item>
          </validation-provider>
          <u-submit-button
            :click="submit.bind(this)"
            place="right"
          >
            <template slot-scope="scope">
              <u-linear-layout>
                <u-button
                  color="primary"
                  :disabled="invalid || scope.submitting"
                  :icon="scope.submitting ? 'loading' : ''"
                  @click="scope.submit"
                >
                  确定
                </u-button>
                <u-button @click="close">
                  取消
                </u-button>
              </u-linear-layout>
            </template>
          </u-submit-button>
        </kube-form>
      </validation-observer>
    </u-modal> -->
  </div>
</template>

<script>
import { cloneDeep, get as getFunc, set as setFunc } from 'lodash';
import { Modal } from '@micro-app/common/mixins';
import clusterService from 'kubecube/services/cluster.js';
import k8sResourceService from 'kubecube/services/k8s-resource';
import { CLUSTER_NETWORK_TYPE_MAP } from 'kubecube/utils/constance';
import { encode, decode } from 'js-base64';
import { validatorsMixin } from 'kubecube/mixins';
import { get } from 'vuex-pathify';
const getDefaultCluster = () => ({
    clusterDisplayName: '',
    clusterName: '',
    networkType: 'calico',
    description: '',
    kubeConfig: '',
});
export default {
    mixins: [ Modal, validatorsMixin ],
    props: {
        instance: Object,
    },
    data() {
        return {
            uploadErrorMsg: '',
            model: getDefaultCluster(),
            isEdit: false,
            networkTypes: Object.keys(CLUSTER_NETWORK_TYPE_MAP).map(key => ({ text: CLUSTER_NETWORK_TYPE_MAP[key].text, value: key })),
            otherNetworkType: false,
            submitLoading: false,
        };
    },
    computed: {
        controlClusterList: get('scope/controlClusterList'),
    },
    methods: {
        open(item) {
            console.log(item);
            this.model = getDefaultCluster();
            this.show = true;
            if (item) {
                Object.assign(
                    this.model,
                    {
                        clusterDisplayName: getFunc(item, 'annotations.["cluster.kubecube.io/cn-name"]', ''),
                        clusterName: item.clusterName,
                        description: item.clusterDescription,
                        networkType: item.networkType,
                    }
                );
                this.isEdit = true;
                this.otherNetworkType = !this.networkTypes.find(i => i.value === item.networkType);
            }
        },
        onUpload(event) {
            event.preventDefault();
            const reader = new FileReader();
            reader.readAsText(event.file);
            reader.onload = e => { this.model.kubeConfig = e.target.result; };
        },
        uploadError(e) {
            if (e.name === 'ExtensionError') {
                this.uploadErrorMsg = `只能上传 ${e.extensions.join(', ')} 类型的文件！`;
            } else { this.uploadErrorMsg = e.message; }
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
                if (this.isEdit) {
                    const clusterYaml = await k8sResourceService.getClusterCRResourceInstance({
                        pathParams: {
                            cluster: this.controlClusterList[0].clusterName,
                            group: 'cluster.kubecube.io',
                            version: 'v1',
                            plural: 'clusters',
                            name: this.model.clusterName,
                        },
                    });
                    setFunc(clusterYaml, 'spec.description', this.model.description);
                    setFunc(clusterYaml, 'spec.networkType', this.model.networkType);
                    setFunc(clusterYaml, 'metadata.annotations.["cluster.kubecube.io/cn-name"]', this.model.clusterDisplayName);
                    await k8sResourceService.modifyClusterCRResource({
                        pathParams: {
                            cluster: this.controlClusterList[0].clusterName,
                            group: 'cluster.kubecube.io',
                            version: 'v1',
                            plural: 'clusters',
                            name: this.model.clusterName,
                        },
                        data: clusterYaml,
                    });
                } else {
                    const data = cloneDeep(this.model);
                    data.kubeConfig = encode(data.kubeConfig);
                    await clusterService.addCluster({
                        data,
                    });
                }
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
