<template>
  <el-form-item
    label="存储"
  >
    <el-switch
      v-model="model.enable"
      :disabled="isEdit"
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
          <i v-if="loading" class="el-icon-loading" style="font-size:24px"/>
          <template v-else>
            <dynamicCard
              v-model="model.templates"
              validateFile="spec.volumeClaimTemplates.templates"
              :getDefaultItem="getDataTemplate"
              :initialAdd="true"
              :minCount="1"
              addButtonText="添加声明模板"
              :disabled="isEdit"
              :miniFormatter="(item, index) => {
                return `配置 - ${index + 1}`
              }"
            >
              <template slot-scope="{item, index}">
                <el-form-item
                  label="存储类别"
                  :prop="`spec.volumeClaimTemplates.templates.${index}.storageClassName`"
                  :rules="[
                    { required: true, message: '存储类别不能为空'},
                  ]"
                  style="margin-bottom: 22px;"
                >
                  <el-select
                    v-model="item.storageClassName"
                    :disabled="isEdit"
                  >
                    <el-option
                      v-for="optionItem in data"
                      :key="optionItem.value"
                      :label="optionItem.text"
                      :value="optionItem.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  label="名称"
                  :prop="`spec.volumeClaimTemplates.templates.${index}.name`"
                  :rules="[
                    { required: true, message: '名称不能为空'},
                    validators.k8sResourceNameValidator(),
                  ]"
                  style="margin-bottom: 22px;"
                >
                  <el-input v-model="item.name" :disabled="isEdit" placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"/>
                </el-form-item>
                <el-form-item
                  label="容量"
                  style="margin-bottom: 22px;"
                >
                  <el-input-number v-model="item.storage" :min="1" controls-position="right" style="width: 300px;" :disabled="isEdit"/>
                  <span style="margin-left:8px">GiB</span>
                </el-form-item>
                <el-form-item
                  label="模式"
                  style="margin-bottom: 22px;"
                >
                  <el-select
                    v-model="item.accessModes"
                    :disabled="isEdit"
                  >
                    <el-option
                      v-for="optionItem in PVC_MODES"
                      :key="optionItem.value"
                      :label="optionItem.text"
                      :value="optionItem.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </template>
            </dynamicCard>
          </template>
        </template>
      </x-request>
    </template>
  </el-form-item>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
import { PVC_MODE_MAP } from 'kubecube/utils/constance';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            validators,
            storageService: workloadService.getStorage,
            PVC_MODES: Object.keys(PVC_MODE_MAP).map(key => ({
                text: PVC_MODE_MAP[key],
                value: key,
            })),
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
                params: {
                    pageSize: 10000,
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
