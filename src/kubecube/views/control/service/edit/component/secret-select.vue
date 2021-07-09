<template>
  <kube-form-item
    label="证书"
    required
    layout="block"
    v-bind="$attrs"
  >
    <x-request
      ref="request"
      :service="service"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading }">
        <slot
          name="data"
          :data="data"
          :setVisible="setVisible"
        />

        <template v-if="visible">
          <br v-if="$attrs.description">
          <u-select
            v-if="(data || []).length > 0"
            v-model="model"
            :data="data || []"
            size="large"
          />
          <u-select
            v-else
            v-model="model"
            disabled
            size="large"
            :data="[{text: '暂无证书'}]"
          />
          <u-quick-create
            :loading="loading"
            :to="{ path: `/control/secrets/list` }"
            name="证书"
            @refresh="refresh"
          />
        </template>
      </template>
    </x-request>
  </kube-form-item>
</template>

<script>
import { get } from 'vuex-pathify';
import { get as getFunc } from 'lodash';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import workloadService from 'kubecube/services/k8s-resource';
import { toPlainObject as toMetadataPlainObject } from 'kubecube/k8s-resources/metadata';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
export default {
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
        initVisible: Boolean,
    },
    data() {
        return {
            service: workloadService.getAPIV1,
            workloadName: null,
            visible: this.initVisible,
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
                    resource: 'secrets',
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
                current: this.model,
            }, val => {
                this.model = getFunc(val, 'value');
            });
            return list;
        },
        setVisible(val) {
            this.visible = val;
        },
        refresh() {
            this.$refs.request.request();
        },
    },
};
</script>

<style>

</style>
