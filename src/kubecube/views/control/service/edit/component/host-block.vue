<template>
  <kube-form-item
    label="转发规则"
    required
    layout="block"
  >
    <x-request
      ref="request"
      style="margin-top: 10px"
      :service="service"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading }">
        <u-loading v-if="loading" />
        <template v-else>
          <!-- <validation-provider
         v-else
    ref="provider"
    :name="`HOST`"
    :detect-input="false"
    :rules="{
      arrayRequired: {
        filterkey: ['host', 'service', 'port']
      },
    }"
  > -->
          <kube-dynamic-block
            v-model="model"
            :layout-comp="blockLayout"
            :row-comp="blockRowLayout"
            :column-comp="null"
            :data-template="getRuleTemplate"

            button-name="添加"
          >
            <template slot-scope="{ model: row, index: hostIndex }">
              <kube-form label-size="small">
                <u-linear-layout direction="vertical">
                  <validation-provider
                    v-slot="{ errors }"
                    :name="`Host-${hostIndex}`"
                    rules="required"
                  >
                    <kube-form-item
                      :message="errors && errors[0]"
                      label="域名"
                      required
                    >
                      <u-input
                        v-model="row.host"
                        size="normal large"
                        :color="errors && errors[0] ? 'error' : ''"
                      />
                      <u-text> :{{ port }}</u-text>
                    </kube-form-item>
                  </validation-provider>
                </u-linear-layout>
                <secret-select
                  v-if="enableSecret"
                  v-model="row.secretName"
                  :init-visible="true"
                />

                <path-table
                  v-model="row.httpPath"
                  :default-service="defaultService"
                  :service-list="data"
                  :index="hostIndex"
                />
              </kube-form>
            </template>
          </kube-dynamic-block>
        </template>
        <!--
            <
            validation-provider
          >
            -->
      </template>
    </x-request>
  </kube-form-item>
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

export default {
    components: {
        secretSelect,
        pathTable,
    },
    mixins: [ makeVModelMixin ],
    props: {
        enableSecret: Boolean,
        port: Number,
    },
    data() {
        return {
            service: workloadService.getAPIV1,
            defaultService: '',

            blockLayout,
            blockRowLayout,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
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
    },
};
</script>

<style>

</style>
