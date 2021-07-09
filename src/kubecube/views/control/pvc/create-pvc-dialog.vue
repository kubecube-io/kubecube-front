<template>
  <u-modal
    :title="isEdit ? '编辑存储声明' : '创建存储声明'"
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
      <x-request
        ref="request"
        :service="storageService"
        :params="params"
        :processor="storageResolver"
      >
        <template slot-scope="{ data, loading }">
          <u-loading v-if="loading" />
          <kube-form
            v-else
            label-size="small"
          >
            <kube-form-item label="存储类别">
              <u-select
                v-if="data.length"
                key="list"
                v-model="model.spec.storageClassName"
                :disabled="isEdit"
                size="large"
                :data="data"
              />
              <u-select
                v-else
                key="none"
                disabled
                size="large"
                :data="[{ text: '暂无存储类别'}]"
              />
            </kube-form-item>
            <kube-name-input
              v-model="model.metadata.name"
              :disabled="isEdit"
            />
            <validation-provider
              v-slot="{ errors }"
              name="storage"
              :rules="{
                NumberBiggerThen: {
                  min: initStorage,
                },
              }"
            >
              <kube-form-item
                label="容量"
                :message="errors && errors[0]"
                name="storage"
              >
                <u-linear-layout
                  direction="horizontal"
                  style="display: flex; flex-direction: horizontal; align-items: center; justify-content: center;"
                >
                  <u-input
                    v-model="model.spec.storage"
                    size="large"
                    :color="errors && errors[0] ? 'error' : ''"
                  />
                  <u-text>GiB</u-text>
                </u-linear-layout>
              </kube-form-item>
            </validation-provider>

            <kube-form-item label="模式">
              <u-select
                v-model="model.spec.accessMode"
                :disabled="isEdit"
                size="large"
                :data="getModes(data)"
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
        </template>
      </x-request>
    </validation-observer>
  </u-modal>
</template>

<script>
import { get as getFunc, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toStorageClassPlainObject,
} from 'kubecube/k8s-resources/storageclass';
import {
    toPlainObject as toPVCPlainObject,
    toK8SObject as toPVCK8SObject,
    patchK8SObject as PatchPVCK8SObject,
} from 'kubecube/k8s-resources/persistentvolumeclaim';
import {
    PVC_MODE_TEXT_MAP,
} from 'kubecube/utils/constance';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';

const modes = Object.keys(PVC_MODE_TEXT_MAP).map(key => ({
    text: PVC_MODE_TEXT_MAP[key],
    value: key,
}));
export default {
    mixins: [ Modal ],
    data() {
        return {
            storageService: workloadService.getStorage,
            model: toPVCPlainObject(),
            isEdit: false,
            initStorage: 0,

        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'storageclasses',
                },
            };
        },
    },
    methods: {
        async open(item) {
            if (item) {
                this.isEdit = true;
                const response = await workloadService.getAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'persistentvolumeclaims',
                        name: item.metadata.name,
                    },
                });
                this.model = toPVCPlainObject(response);

            }
            this.show = true;
        },
        storageResolver(response) {
            const items = (response.items || []).map(toStorageClassPlainObject).map(t => ({
                text: t.metadata.name,
                value: t.metadata.name,
                ...t,
            }));
            setValueIfListNotPresent({
                list: items,
                path: 'value',
                current: getFunc(this.model, 'spec.storageClassName'),
            }, val => {
                this.model.spec.storageClassName = getFunc(val, 'value');
            });
            return items;
        },
        getModes(storageClassNames) {
            if (storageClassNames.length === 0 || !this.model.spec.storageClassName) return [];
            const curr = storageClassNames.find(sc => sc.value === this.model.spec.storageClassName);
            return curr.provisioner === 'ceph.com/rbd' ? modes.slice(0, 2) : modes;
        },
        async submit() {
            if (this.isEdit) {
                const yaml = cloneDeep(this.model.puresource);
                console.log(yaml);
                yaml.spec.resources.requests.storage = `${this.model.spec.storage}Gi`
                await workloadService.modifyAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'persistentvolumeclaims',
                        name: this.model.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = toPVCK8SObject(this.model);
                await workloadService.createAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'persistentvolumeclaims',
                    },
                    data: yaml,
                });
            }
            this.$emit('refresh');
            this.close();
        },
    },
};
</script>

<style>

</style>
