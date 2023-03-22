<template>
  <div>
    <el-form-item 
      label="Selector"
      :prop="prop"
      :rules="[
        ...(required ? [ validators.required() ] : []),
        validators.arrayRequired(required ? 'key' : ''),
      ]"
    >
      <div>
        <el-switch v-if="showSwitch" v-model="localSwitchStatus" @change="() => {model = [];workloadName = null;}" style="margin-right:12px"></el-switch>
      </div>
      <template v-if="!showSwitch || localSwitchStatus">
        <div style="color: rgb(153, 153, 153);"><span>若关联多个工作负载，请使用高级模式</span></div>
        <el-radio-group v-model="mode" v-if="showModeRadio" :disabled="insertNsfLabel">
          <el-radio label="simple">
            简单
          </el-radio>
          <el-radio label="hard">
            高级
          </el-radio>
        </el-radio-group>
        <template v-if="mode === 'simple'">
          <x-request
            ref="request"
            style="margin-top: 10px"
            :service="service"
            :params="requestParam"
            :processor="resolver"
          >
            <template slot-scope="{ data }">
              <el-select
                v-if="data && showResource.some(resource => ((data[resource] || []).length > 0))"
                v-model="workloadName"
                filterable
              >
                <el-option-group v-for="resource in showResource" :label="resource" :key="resource">
                  <el-option
                    v-for="item in data[resource]"
                    :key="`${resource}:${item.value}`"
                    :label="item.text"
                    :value="`${resource}:${item.value}`"
                  />
                </el-option-group>
              </el-select>
              <el-input
                v-else
                v-model="workloadName"
                disabled
                size="large"
                placeholder="暂无工作负载"
              />
            </template>
          </x-request>
        </template>
        <template v-if="mode === 'hard'">
          <label-editor
            v-model="showModel"
            :no-system-key-rule="true"
            :prefixProp="prop"
          />
        </template>
      </template>
    </el-form-item>
  </div>
</template>

<script>

import { get as getFunc, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import workloadService from 'kubecube/services/k8s-resource';
// import labelEditor from 'kubecube/component/global/k8s/label-editor';
import { toPlainObject as toMetadataPlainObject } from 'kubecube/k8s-resources/metadata';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ makeVModelMixin ],
    inject: [ 'elForm' ],
    props: {
        prop: {
            type: String,
            default: '',
        },
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
        showResource: {
            type: Array,
            default: () => [ 'deployments', 'statefulsets' ],
        },
        showModeRadio: {
            type: Boolean,
            default: true,
        },
        showSwitch: {
            type: Boolean,
            default: false,
        },
        switchStatus: {
            type: Boolean,
            default: true,
        },
        insertNsfLabel: {
            type: Boolean,
            default: false,
        },
        serviceName: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            validators,
            mode: this.isEdit ? 'hard' : 'simple',
            // service: workloadService.getWorkloads,
            workloadName: null,
            oldModel: [],
            localSwitchStatus: this.switchStatus,
            workloadList: {},
            historyInfo: null,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        requestParam() {
            return {
                showResource: this.showResource,
                cluster: this.cluster,
                namespace: this.namespace,
            };
        },
        showModel: {
          get() {
            if(this.model.find(item => item.key === 'nsf.skiff.netease.com/app' && item.disabled !== this.insertNsfLabel )) {
              return this.model.map(item => {
                if (item.key === 'nsf.skiff.netease.com/app') {
                  item.disabled = this.insertNsfLabel;
                }
                return item;
              })
            }
            
            return this.model;
          },
          set(val) {
            this.model = val;
          }
        }
    },
    watch: {
        switchStatus(val) {
          this.localSwitchStatus = val
        },
        localSwitchStatus(val) {
          this.$emit('update:switchStatus', val);
        },
        mode(val) {
            if (val === 'hard') {
              this.model = this.oldModel;
              this.workloadName = null;
            } else if (val === 'simple') {
              this.oldModel = this.model;
              this.model = []
            }
        },
        workloadName(val) {
            if(!val) {
              return;
            }
            const resourceMap = {
              deployments: 'deployment',
              statefulsets: 'statefulset',
            }
            let [ kind, app ] = val.split(':');
            let target = (this.workloadList[kind] || []).find(item => item.value === app);
            if(target) {
              let keys = Object.keys(target.labels);
              if (keys.includes('kubecube.io/app') && keys.includes('kubecube.io/kind')) {
                this.model = [
                  {
                    key: 'kubecube.io/app',
                    value: target.labels['kubecube.io/app'],
                  },
                  {
                    key: 'kubecube.io/kind',
                    value: target.labels['kubecube.io/kind'],
                  }
                ];
              } else {
                this.model = keys.map(key => {
                  return ({
                    key,
                    value: target.labels[key],
                  })
                })
              }
            } else {
              this.model = []
            }
            // this.model = [
            //   {
            //     key: 'kubecube.io/app',
            //     value: app,
            //   },
            //   {
            //     key: 'kubecube.io/kind',
            //     value: resourceMap[kind],
            //   }
            // ];
        },
        required() {
            this.$nextTick(() => {
                this.elForm.validateField(this.prop);
            });
        },
        model: {
            handler(val) {
                this.elForm.validateField(this.prop);
            },
            deep: true,
        },
        serviceName(val) {
          if(this.insertNsfLabel) {
            const target = this.model.find(item => item.disabled === true && item.key === 'nsf.skiff.netease.com/app');
            if(target) {
              target.value = val;
            }
          }
        }
    },
    methods: {
      forceUpdateMode(val, model) {
        if (val) {
          const historyInfo = {
            mode: this.mode,
            workloadName: this.workloadName,
            model: cloneDeep(this.model),
          }
          this.mode = val;
          if(model) {
            this.historyInfo = historyInfo;
            this.$nextTick(() => {
              this.model = model;
            })
          }
        } else if(this.historyInfo){
          if (this.historyInfo.mode === 'simple') {
            this.mode = 'simple';
            this.$nextTick(() => {
              this.oldModel = [];
            })
          }
          if (this.historyInfo.mode === 'hard') {
            this.mode = 'hard';
            this.$nextTick(() => {
              this.model = this.historyInfo.model;
            })
          }
        } else {
          this.mode = 'hard';
        }
      },
      service(params) {
        let pArr = params.showResource.map(resource => {
          return workloadService.getWorkloads({
            pathParams: {
              cluster: params.cluster,
              namespace: params.namespace,
              resource,
            },
            params: {
              pageSize: 10000,
            },
          })
        })
        return Promise.all(pArr);
      },
      resolver(response) {
        const data = {}
        this.showResource.forEach((resource, index) => {
          data[resource] = (response[index].items || []).map(item => {
              return {
                  text: item.metadata.name,
                  value: item.metadata.name,
                  labels: getFunc(item, 'spec.template.metadata.labels')
              }
            });
        });
        this.workloadList = data;
        setValueIfListNotPresent({
            list: data[this.showResource[0]],
            path: 'value',
            current: this.workloadName,
        }, val => {
            this.workloadName = `${this.showResource[0]}:${getFunc(val, 'value')}`;
        });
        return data;
      },
    },
};
</script>

<style>

</style>
