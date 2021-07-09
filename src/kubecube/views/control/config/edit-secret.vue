<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form>
      <kube-name-input
        v-model="model.metadata.name"
        :disabled="isEdit"
      />

      <kube-form-item
        label="类型"
        required
      >
        <u-select
          v-model="model.type"
          size="huge"
          :data="SECRET_TYPES"
          :disabled="isEdit"
        />
      </kube-form-item>

      <template v-if="model.type === 'Opaque'">
        <kube-form-item
          label="数据"
          layout="block"
        >
          <opaque-input v-model="model.data" />
        </kube-form-item>
      </template>
      <template v-if="model.type === 'kubernetes.io/tls'">
        <validation-provider
          v-slot="{ errors }"
          name="crt"
          rules="required"
        >
          <kube-form-item
            label="证书内容"
            required
            layout="block"
            :message="errors && errors[0]"
          >
            <u-textarea
              v-model="model.dataSource['tls.crt']"
              :class="$style.textarea"
              :color="errors && errors[0] ? 'error' : ''"
              resize="none"
              placeholder="请输入PEM编码"
            />
            <u-uploader
              :class="$style.uploader"
              extensions="crt"
              max-size="1MB"
              @before-send="onUpload($event, 'tls.crt')"
              @error="uploadError($event, 'tls.crt')"
            >
              <u-link>上传文件</u-link>
            </u-uploader>
          </kube-form-item>
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          name="crtkey"
          rules="required"
        >
          <kube-form-item
            label="私钥"
            required
            layout="block"
            :message="errors && errors[0]"
          >
            <u-textarea
              v-model="model.dataSource['tls.key']"
              :class="$style.textarea"
              :color="errors && errors[0] ? 'error' : ''"
              resize="none"
              placeholder="请输入PEM编码"
            />
            <u-uploader
              :class="$style.uploader"
              extensions="crt"
              max-size="1MB"
              @before-send="onUpload($event, 'tls.key')"
              @error="uploadError($event, 'tls.key')"
            >
              <u-link>上传文件</u-link>
            </u-uploader>
          </kube-form-item>
        </validation-provider>
      </template>
      <template v-if="model.type === 'kubernetes.io/dockerconfigjson'">
        <kube-form-item
          label="数据"
          required
          layout="block"
        >
          <docker-config v-model="model.dockerData" />
        </kube-form-item>
      </template>
      <kube-form-item>
        <u-submit-button
          :click="submit.bind(this)"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                {{ isEdit ? "提交设置" : "立即创建" }}
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form-item>
    </kube-form>
  </validation-observer>
</template>

<script>
import { cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toSecretPlainObject,
    toK8SObject as toSecretK8SObject,
    patchK8SObject as toPatchSecretObject,
} from 'kubecube/k8s-resources/secret';
import {
    SECRET_TYPES,
} from 'kubecube/utils/constance';
import opaqueInput from './opaque-input.vue';
import dockerConfig from './docker-config.vue';

export default {
    components: {
        opaqueInput,
        dockerConfig,
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            SECRET_TYPES,
            model: cloneDeep(this.instance) || toSecretPlainObject(),
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
    },
    methods: {
        onUpload(event, key) {
            event.preventDefault();
            const reader = new FileReader();
            reader.readAsText(event.file);
            reader.onload = e => {
                this.model.dataSource[key] = e.target.result;
            };
        },
        uploadError(e, key) {
            const ref = this.$refs[key];
            ref.color = 'error';
            if (e.name === 'ExtensionError') { ref.currentMessage = `只能上传 ${e.extensions.join(', ')} 类型的文件！`; } else { ref.currentMessage = e.message; }
            this.model.dataSource[key] = '';
        },
        async submit() {
            if (this.isEdit) {
                const yaml = toPatchSecretObject(this.model);
                console.log(yaml);
                await workloadService.patchAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'secrets',
                        name: this.instance.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = toSecretK8SObject(this.model);
                await workloadService.createAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'secrets',
                    },
                    data: yaml,
                });
            }

            this.$router.push({ path: '/control/secrets/list' });
        },
    },
};
</script>

<style module>
.desc {
    display: inline-block;
    max-width: 580px;
    color: #999;
    padding-bottom: 10px;
}
.mode {
    margin-bottom: 20px;
}
.wrap {
    margin-bottom: 20px;
}
.title {
    margin-bottom: 5px;
}
.upload {
    position: absolute;
    bottom: -25px;
    right: 0;
}
.textarea[class] {
    width: 580px;
    height:150px;
}
.uploader[class] {
    display: block;
}
</style>
