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

        <kube-form-item
          label="网络类型"
        >
          <u-select
            v-model="model.networkType"
            :data="networkTypes"
            size="large"
          />
        </kube-form-item>
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
            const response = await clusterService.addCluster({
                data,
            });
            const p = decode(response);
            const filename = 'bootstap.sh';
            const url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(p);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove(); // afte
        },
    },
};
</script>

<style>

</style>
