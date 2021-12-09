<template>
  <u-modal
    :title=" isEdit ? '创建集群': '添加集群' "
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
  </u-modal>
</template>

<script>
import { cloneDeep } from 'lodash';
import { Modal } from '@micro-app/common/mixins';
import clusterService from 'kubecube/services/cluster.js';
import { CLUSTER_NETWORK_TYPE_MAP } from 'kubecube/utils/constance';
import { encode, decode } from 'js-base64';
const getDefaultCluster = () => ({
    clusterName: '',
    networkType: 'calico',
    description: '',
    kubeConfig: '',
});
export default {
    mixins: [ Modal ],
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
        };
    },

    methods: {
        open() {
            this.model = getDefaultCluster();
            this.show = true;
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
            const data = cloneDeep(this.model);
            data.kubeConfig = encode(data.kubeConfig);
            await clusterService.addCluster({
                data,
            });
            this.show = false;
            this.$emit('refresh');
        },
    },
};
</script>

<style>

</style>
