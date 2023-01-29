<template>
  <div>
    <x-request
      ref="request"
      style="margin-top: 10px"
      :service="service"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading }">
        <i v-if="loading" class="el-icon-loading" style="font-size: 24px"/>
        <dynamicCard
          v-else
          v-model="model"
          :initialAdd="true"
          :minCount="1"
          :getDefaultItem="getRuleTemplate"
          addButtonText="添加分组"
          :validateFile="prefixProp"
        >
          <template slot-scope="{ item: ruleModel, index: ruleIndex }">
            <el-form-item 
              label="域名"
              :rules="[
                validators.required(),
              ]"
              :prop="`${prefixProp}.${ruleIndex}.host`"
              style="margin-bottom: 24px"
            >
              <host-input
                v-model="ruleModel.host"
                :port="port"
                :domainSuffixList="domainSuffixList"
              />
            </el-form-item>
            <secretSelect
              v-if="enableSecret"
              v-model="ruleModel.secretName"
              :init-visible="true"
              :prefixProp="`${prefixProp}.${ruleIndex}.secretName`"
            />
            <el-form-item 
              label="路径"
              :rules="[
                validators.required(),
              ]"
              :prop="`${prefixProp}.${ruleIndex}.httpPath`"
            >
              <path-table
                v-model="ruleModel.httpPath"
                :default-service="defaultService"
                :service-list="data"
                :index="ruleIndex"
                :prefixProp="`${prefixProp}.${ruleIndex}.httpPath`"
              />
            </el-form-item>
          </template>
        </dynamicCard>
      </template>
    </x-request>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import workloadService from 'kubecube/services/k8s-resource';
import { toPlainObject as toMetadataPlainObject } from 'kubecube/k8s-resources/metadata';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
import blockLayout from 'kubecube/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubecube/component/common/kube-dynamic-block-layout/row.vue';
import secretSelect from './secret-select.vue';
import pathTable from './path-table.vue';
import k8sCommonExtendResourceService from 'kubecube/services/k8s-common-extend-resource';
import hostInput from './host-input.vue';
import dynamicCard from 'kubecube/elComponent/dynamic-card/index.vue';
import dynamicBlock from 'kubecube/elComponent/dynamic-block/index.vue';
import * as validators from 'kubecube/utils/validators';
export default {
    components: {
        secretSelect,
        pathTable,
        hostInput,
        dynamicCard,
        dynamicBlock
    },
    mixins: [ makeVModelMixin ],
    props: {
        enableSecret: Boolean,
        port: Number,
        prefixProp: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            validators,
            service: workloadService.getAPIV1,
            defaultService: '',

            blockLayout,
            blockRowLayout,
            domainSuffixList: [],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        project: get('scope/project@value'),
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'services',
                },
            };
        },
    },
    created() {
        this.loadDomainSuffix();
    },
    methods: {
        resolver(response) {
            const list = (response.items || []).map(toMetadataPlainObject).map(metadata => {
                return {
                    text: metadata.name,
                    value: metadata.name,
                    ...metadata,
                };
            });
            setValueIfListNotPresent({
                list,
                path: 'value',
                current: this.defaultService,
            }, val => {
                this.defaultService = getFunc(val, 'value');
            });
            return list;
        },
        getRuleTemplate() {
            return {
                host: '',
                secretName: '',
                httpPath: [],
            };
        },
        getRowErrorTip() {

        },
        async loadDomainSuffix() {
            const res = await k8sCommonExtendResourceService.getResources({
                pathParams: {
                    resource: 'ingressDomainSuffix',
                },
                params: {
                    cluster: this.cluster,
                    project: this.project,
                },
            });
            this.domainSuffixList = res.map(val => ({ value: val, text: val }));
        },
    },
};
</script>

<style>

</style>
