<template>
  <div>
    <dynamicCard
      v-model="model"
      :getDefaultItem="getTemplate"
      :miniFormatter="miniFormatter"
      :validateFile="prefixProp"
    >
      <template slot-scope="{ item: dataModel, index: dataIndex }">
        <el-form-item
          label="IP 段"
          style="margin-bottom: 24px;"
        >
          <template slot="label">
            IP 段
            <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
              <div slot="content">
                ip规则同空间、副本选择规则不可同时设置。
              </div>
              <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
            </el-tooltip>
          </template>
          <el-radio-group v-model="dataModel.ipBlock.enable" @change="onChangeIp($event, dataModel)">
            <el-radio :label="false">不设置 IP 段</el-radio>
            <el-radio :label="true">指定 IP 段</el-radio>
          </el-radio-group>
          <div v-if="dataModel.ipBlock.enable">
            <div style="padding-left:8px;color:#909399;">
              CIDR
            </div>
            <el-form-item
              :prop="`${prefixProp}.${dataIndex}.ipBlock.cidr`"
              :rules="[
                validators.required(),
                validators.cidr(false),
              ]"
            >
              <el-input
                v-model="dataModel.ipBlock.cidr"
              />
            </el-form-item>
            <cidr-input
              v-model="dataModel.ipBlock.except"
              :prefixProp="`${prefixProp}.${dataIndex}.ipBlock.except`"
            />
          </div>
        </el-form-item>
        <el-form-item
          label="空间规则"
          style="margin-bottom: 24px;"
        >
          <el-radio-group v-model="dataModel.namespaceSelector.enable" :disabled="dataModel.namespaceSelector.disabled">
            <el-radio :label="false">所有空间</el-radio>
            <el-radio :label="true">符合规则的空间</el-radio>
          </el-radio-group>
          <regular-input
            v-if="dataModel.namespaceSelector.enable"
            isRequired
            v-model="dataModel.namespaceSelector.matchExpressions"
            :prefixProp="`${prefixProp}.${dataIndex}.namespaceSelector.matchExpressions`"
          />
        </el-form-item>
        <el-form-item
          label="副本规则"
          style="margin-bottom: 24px;"
        >
          <el-radio-group v-model="dataModel.podSelector.enable" :disabled="dataModel.podSelector.disabled">
            <el-radio :label="false">所有副本</el-radio>
            <el-radio :label="true">符合规则的副本</el-radio>
          </el-radio-group>
          <regular-input
            v-if="dataModel.podSelector.enable"
            isRequired
            v-model="dataModel.podSelector.matchExpressions"
            :prefixProp="`${prefixProp}.${dataIndex}.podSelector.matchExpressions`"
          />
        </el-form-item>
      </template>
    </dynamicCard>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import blockLayout from 'kubecube/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubecube/component/common/kube-dynamic-block-layout/row.vue';
import cidrInput from './cidr-inputs.vue';
import regularInput from './regular-input.vue';
import dynamicCard from 'kubecube/elComponent/dynamic-card/index.vue';
import * as validators from 'kubecube/utils/validators';
export default {
    components: {
        cidrInput,
        regularInput,
        dynamicCard,
    },
    mixins: [ makeVModelMixin ],
    props: {
        prefixKey: {
            type: String,
            default: '',
        },
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            blockLayout,
            blockRowLayout,
            validators,
        };
    },
    methods: {
        miniFormatter(item) {
            return `CIDR:${item.ipBlock.enable && item.ipBlock.cidr || ' - '} 空间规则:${item.namespaceSelector.enable ? item.namespaceSelector.matchExpressions.length : 0} 副本规则:${item.podSelector.enable ? item.podSelector.matchExpressions.length : 0}`;
        },
        getTemplate() {
            return {
                ipBlock: {
                    enable: false,
                    cidr: '',
                    except: [],
                },
                namespaceSelector: {
                    disabled: false,
                    enable: false,
                    matchExpressions: [],
                },
                podSelector: {
                    disabled: false,
                    enable: false,
                    matchExpressions: [],
                },
            };
        },
        onChangeIp($event, model) {
            if ($event) {
                model.namespaceSelector.enable = false;
                model.podSelector.enable = false;
                model.namespaceSelector.disabled = true;
                model.podSelector.disabled = true;
            } else {
                model.namespaceSelector.disabled = false;
                model.podSelector.disabled = false;
            }
        },
    },
};
</script>

<style>

</style>
