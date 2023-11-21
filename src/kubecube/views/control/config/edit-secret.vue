<template>
  <div>
    <el-form ref="form" :model="model" label-position="right" label-width="120px" style="width:80%">
      <el-form-item 
        label="名称" 
        prop="metadata.name"
        :rules="[
          validators.required(),
          validators.k8sResourceNameValidator()
        ]"
      >
        <el-input v-model="model.metadata.name" :disabled="isEdit" placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"/>
      </el-form-item>
      <el-form-item 
        label="类型" 
        prop="type"
        :rules="[
          validators.required()
        ]"
      >
        <el-select 
          v-model="model.type"
          :disabled="isEdit"
        >
          <el-option
            v-for="item in SECRET_TYPES"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
          />
        </el-select>
      </el-form-item>
      <template v-if="model.type === 'Opaque'">
        <el-form-item 
          label="数据" 
          prop="type"
        >
          <opaque-input v-model="model.data" prefixProp="data"/>
        </el-form-item>
      </template>
      <template v-if="model.type === 'kubernetes.io/tls'">
        <el-form-item 
          label="证书内容"
        >
          <el-input
            v-model="model.dataSource['tls.crt']"
            type="textarea"
            :rows="5"
            placeholder="请输入PEM编码"
          />
          <u-uploader
            :class="$style.uploader"
            :extensions="[ 'pem', 'der', 'pfx', 'jks', 'kdb', 'cer', 'key', 'csr', 'crt', 'crl', 'ocsp', 'scep' ]"
            max-size="1MB"
            @before-send="onUpload($event, 'tls.crt')"
            @error="uploadError($event, 'tls.crt')"
          >
            <el-link type="primary">上传文件</el-link>
          </u-uploader>
          <span ref="tls.crt"></span>
        </el-form-item>
        <el-form-item 
          label="私钥"
        >
          <el-input
            v-model="model.dataSource['tls.key']"
            type="textarea"
            :rows="5"
            placeholder="请输入PEM编码"
          />
          <u-uploader
            :class="$style.uploader"
            :extensions="[ 'pem', 'der', 'pfx', 'jks', 'kdb', 'cer', 'key', 'csr', 'crt', 'crl', 'ocsp', 'scep' ]"
            max-size="1MB"
            @before-send="onUpload($event, 'tls.key')"
            @error="uploadError($event, 'tls.key')"
          >
            <el-link type="primary">上传文件</el-link>
          </u-uploader>
          <span ref="tls.key"></span>
        </el-form-item>
      </template>
      <template v-if="model.type === 'kubernetes.io/dockerconfigjson'">
        <el-form-item 
          label="数据" 
          prop="type"
        >
          <docker-config v-model="model.dockerData" prefixProp="dockerData"/>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button
          type="primary"
          @click="submit"
          :loading="submitLoading"
        >
          {{ isEdit ? '立即修改' : '立即创建' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { cloneDeep, get as getFunc } from 'lodash';
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
import * as validators from 'kubecube/utils/validators';

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
            validators,
            submitLoading: false,
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
            const ref = this.$refs[key];
            ref.innerText = '';
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
            if (e.name === 'ExtensionError') { ref.innerText = `只能上传 ${e.extensions.join('、')} 文件！`; } else { ref.innerText = e.message; }
            this.model.dataSource[key] = '';
        },
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            this.submitLoading = true;
            try {
                if (this.isEdit) {
                    const puresource = this.model.puresource;
                    const yaml = toPatchSecretObject(this.model);
                    puresource.data = yaml.data;
                    await workloadService.modifyAPIV1Instance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'secrets',
                            name: this.instance.metadata.name,
                        },
                        data: puresource,
                        noAlert: true,
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
                        noAlert: true,
                    });
                }
                this.$router.push({ path: '/control/secrets/list' });
            } catch (err) {
                this.$globalErrorModal(getFunc(err, 'details.causes[0]') || err);
            }
            this.submitLoading = false;
        },
        handleValidate() {
          this.$refs.observer.validate();
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
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubecube/assets/question.svg');
    cursor: pointer;
}
</style>
