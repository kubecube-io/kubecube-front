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
        label="数据"
        layout="block"
      >
        <opaque-input v-model="model.data" />
      </kube-form-item>
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
    toPlainObject as toConfigmapPlainObject,
    toK8SObject as toConfigmapK8SObject,
    patchK8SObject as toPatchConfigmapObject,
} from 'kubecube/k8s-resources/configmap';
import {
    SECRET_TYPES,
} from 'kubecube/utils/constance';
import opaqueInput from './opaque-input.vue';

export default {
    components: {
        opaqueInput,
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            SECRET_TYPES,
            model: cloneDeep(this.instance) || toConfigmapPlainObject(),
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
        async submit() {
            if (this.isEdit) {
                const yaml = toPatchConfigmapObject(this.model);
                console.log(yaml);
                await workloadService.patchAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'configmaps',
                        name: this.instance.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = toConfigmapK8SObject(this.model);
                await workloadService.createAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'configmaps',
                    },
                    data: yaml,
                });
            }

            this.$router.push({ path: '/control/configmaps/list' });
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
