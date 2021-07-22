<template>
  <validation-provider
    ref="provider"
    :name="name"
    :detect-input="false"
    :rules="{
      arrayRequired: {
        filterkey: required ? 'key' : ''
      },
    }"
  >
    <kube-form-item
      label="Selector"
      layout="block"
      :required="required"
      :show-discription="true"
      description="关联工作负载后，系统会自动在服务的标签选择器中增加该工作负载的标签"
    >
      <u-radios v-model="mode">
        <u-radio label="simple">
          简单
        </u-radio>
        <u-radio label="hard">
          高级
        </u-radio>
      </u-radios>

      <template v-if="mode === 'simple'">
        <x-request
          ref="request"
          style="margin-top: 10px"
          :service="service"
          :params="requestParam"
          :processor="resolver"
        >
          <template slot-scope="{ data }">
            <u-select
              v-if="(data || []).length > 0"
              v-model="workloadName"
              :data="data || []"
              size="large"
            />
            <u-select
              v-else
              v-model="workloadName"
              disabled
              size="large"
              :data="[{text: '暂无工作负载'}]"
            />
          </template>
        </x-request>
      </template>
      <template v-if="mode === 'hard'">
        <label-editor
          v-model="model"
          :no-system-key-rule="true"
          style="width: 580px;margin-bottom: 20px;"
        />
      </template>
    </kube-form-item>
  </validation-provider>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import workloadService from 'kubecube/services/k8s-resource';
import labelEditor from 'kubecube/component/global/k8s/label-editor';
import { toPlainObject as toMetadataPlainObject } from 'kubecube/k8s-resources/metadata';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
export default {
    components: {
        labelEditor,
    },
    mixins: [ makeVModelMixin ],
    props: {
        name: {
            type: String,
            default: 'DeploymentInput',
        },
        isEdit: {
            type: Boolean,
            default: false,
        },
        required: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            mode: this.isEdit ? 'hard' : 'simple',
            service: workloadService.getWorkloads,
            workloadName: null,
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
                    resource: 'deployments',
                },
                params: {
                    pageSize: 10000,
                },
            };
        },
    },
    watch: {
        mode() {
            this.model = [];
        },
        workloadName(val) {
            this.model = [{
                key: 'system/app',
                value: val,
            }];
        },
        required() {
            this.$nextTick(() => {
                this.$refs.provider.validate(this.model);
            });
        },
        model: {
            handler(val) {
                this.$refs.provider.validate(val);
            },
            deep: true,
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
                current: this.workloadName,
            }, val => {
                this.workloadName = getFunc(val, 'value');
            });
            return list;
        },
    },
};
</script>

<style>

</style>
