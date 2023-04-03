<template>
  <el-form-item
    label="证书"
    :prop="prefixProp"
    :rules="[
      ...(visible ? [ validators.required() ] : []),
    ]"
  >
    <div v-if="description" style="color: #999">{{description}}</div>
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
        <div v-if="visible">
          <el-select
            v-if="(data || []).length > 0"
            v-model="model" 
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in data"
              :key="item.value"
              :label="item.text"
              :value="item.value"
              :title="item.text"
            />
          </el-select>
          <el-input
            v-else
            v-model="model"
            disabled
            placeholder="暂无证书"
          />
          <div>
            如需新的证书，可
            <el-link
              type="primary"
              @click="openNewWindow({ path: '/control/secrets/list', query: $route.query })"
            >
              创建证书
            </el-link>
            <i
              style="font-size:16px; margin-left: 8px"
              :class="loading ? 'el-icon-loading' : 'el-icon-refresh-right'"
              @click="refresh"
            />
          </div>

          <!-- <u-quick-create
            :loading="loading"
            :to="{ path: `/control/secrets/list` }"
            name="证书"
            @refresh="refresh"
          /> -->
        </div>
      </template>
    </x-request>
  </el-form-item>
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
import * as validators from 'kubecube/utils/validators';
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
        prefixProp: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            service: workloadService.getAPIV1,
            workloadName: null,
            visible: this.initVisible,
            validators,
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
                params: {
                    pageSize: 10000,
                },
            };
        },
    },
    methods: {
        openNewWindow(link) {
            const routeData = this.$router.resolve(link);
            const { origin, pathname } = window.location;
            const url = `${origin}${pathname}${(routeData.href || '').match(/#\S*/)[0]}`;
            window.open(url, '_blank');
        },
        resolver(response) {
            const list = (response.items || []).filter(item => item.type === "kubernetes.io/tls").map(toMetadataPlainObject).map(metadata => {
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
            console.log(val)
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
