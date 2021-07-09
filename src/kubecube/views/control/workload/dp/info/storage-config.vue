<template>
  <kube-form-item
    layout="block"
    label="存储"
  >
    <u-switch
      v-model="model.enable"
      width="wide"
      :disabled="isEdit"
      :with-text="true"
    />
    <template v-if="model.enable">
      <x-request
        ref="request"
        style="margin-top: 10px"
        :service="storageService"
        :params="requestParam"
        :processor="storageResolver"
      >
        <template slot-scope="{ data, loading }">
          <u-loading v-if="loading" />
          <kube-dynamic-block
            v-else
            v-model="model.templates"
            style="width: 578px"
            :layout-comp="blockLayout"
            :row-comp="blockRowLayout"
            :column-comp="null"
            :data-template="getDataTemplate"
            :disabled="isEdit"
            button-name="添加声明模板"
          >
            <template slot-scope="{ model: vctModel, index: vctIndex }">
              <kube-form style="width: 480px">
                <validation-provider
                  v-slot="{ errors }"
                  :name="`storage-${vctIndex}-storageClassName`"
                  rules="required"
                >
                  <kube-form-item
                    :message="errors && errors[0]"
                    label="存储类别"
                  >
                    <u-select
                      v-if="data.length"
                      key="list"
                      v-model="vctModel.storageClassName"
                      :disabled="isEdit"
                      size="huge"
                      :data="data"
                    />
                    <u-select
                      v-else
                      key="none"
                      disabled
                      size="huge"
                      :color="errors && errors[0] ? 'error' : ''"
                      :data="[{ text: '暂无存储类别'}]"
                    />
                  </kube-form-item>
                </validation-provider>

                <kube-name-input
                  v-model="vctModel.name"
                  :name="`storage-${vctIndex}-Name`"
                  :disabled="isEdit"
                />
                <kube-form-item
                  label="容量"
                  name="storage"
                >
                  <u-number-input
                    v-model="vctModel.storage"
                    :min="1"
                    size="normal"
                    :disabled="isEdit"
                  /> GiB
                </kube-form-item>
                <kube-form-item
                  label="模式"
                >
                  <u-select
                    v-model="model.accessModes"
                    :disabled="isEdit"
                    size="huge"
                    :data="PVC_MODES"
                  />
                </kube-form-item>
              </kube-form>
            </template>
          </kube-dynamic-block>
        </template>
      </x-request>
    </template>
  </kube-form-item>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import blockLayout from 'kubecube/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubecube/component/common/kube-dynamic-block-layout/row.vue';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
import { PVC_MODE_MAP } from 'kubecube/utils/constance';

export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            storageService: workloadService.getStorage,
            PVC_MODES: Object.keys(PVC_MODE_MAP).map(key => ({
                text: PVC_MODE_MAP[key],
                value: key,
            })),
            blockLayout,
            blockRowLayout,
            defaultStorage: null,
        };
    },
    computed: {
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        requestParam() {
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
        getDataTemplate() {
            return {
                accessModes: 'ReadWriteOnce',
                storageClassName: this.defaultStorage,
                name: '',
                storage: 1,
            };
        },
        storageResolver(response) {
            const items = (response.items || []).map(t => ({
                text: t.metadata.name,
                value: t.metadata.name,
                ...t,
            }));
            setValueIfListNotPresent({
                list: items,
                path: 'value',
                current: this.defaultStorage,
            }, val => {
                this.defaultStorage = getFunc(val, 'value');
            });
            return items;
        },
    },
};
</script>

<style>

</style>
