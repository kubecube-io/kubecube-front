<template>
  <u-modal
    :title="isEdit ? '编辑告警配置' : '创建告警配置'"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="huge"
    @close="close"
  >
    <u-steps
      v-if="model"
      :value="step"
    >
      <u-step title="全局配置">
        <kube-form label-size="large">
          <kube-form-item label="resolve_timeout">
            <u-input
              v-model="model.global.resolve_timeout"
              size="huge"
            />
          </kube-form-item>
          <kube-form-item label="smtp_smarthost">
            <u-input
              v-model="model.global.smtp_smarthost"
              size="huge"
            />
          </kube-form-item>
          <kube-form-item label="smtp_from">
            <u-input
              v-model="model.global.smtp_from"
              size="huge"
            />
          </kube-form-item>
          <kube-form-item label="smtp_auth_username">
            <u-input
              v-model="model.global.smtp_auth_username"
              size="huge"
            />
          </kube-form-item>
          <kube-form-item label="smtp_auth_password">
            <u-input
              v-model="model.global.smtp_auth_password"
              size="huge"
            />
          </kube-form-item>
          <kube-form-item label="wechat_api_url">
            <u-input
              v-model="model.global.wechat_api_url"
              size="huge"
            />
          </kube-form-item>
          <kube-form-item label="wechat_api_secret">
            <u-input
              v-model="model.global.wechat_api_secret"
              size="huge"
            />
          </kube-form-item>
          <kube-form-item label="wechat_api_corp_id">
            <u-input
              v-model="model.global.wechat_api_corp_id"
              size="huge"
            />
          </kube-form-item>
          <kube-form-item>
            <u-linear-layout direction="horizontal">
              <u-button
                color="primary"
                @click="step+=1"
              >
                下一步
              </u-button>
            </u-linear-layout>
          </kube-form-item>
        </kube-form>
      </u-step>
      <u-step title="通知方式">
        <validation-observer
          v-slot="{ invalid }"
        >
          <kube-form style="margin-top:20px">
            <kube-tab
              v-model="model.receivers"
              :data-template="getReceiverTemplate"
            >
              <template slot-scope="{ model: rcModel, errorPrefix }">
                <kube-form style="margin-top: 20px">
                  <kube-name-input
                    v-model="rcModel.name"
                    :name="`receiver-${errorPrefix}-name`"
                  />
                  <validation-provider
                    v-slot="{ errors }"
                    name="receivers"
                    :rules="{
                      someRequired: {list: rcModel.receivers.map(c => c.enable)}
                    }"
                  >
                    <kube-form-item
                      label="通知方式"
                      :message="errors && errors[0]"
                      name="storage"
                      layout="block"
                      required
                    >
                      <kube-tab
                        v-model="rcModel.receivers"
                        title-key="receiver"
                        disabled
                      >
                        <template slot-scope="{ model: inputsModel }">
                          <div
                            :key="inputsModel.receiver"
                            :class="$style.group"
                          >
                            <div :class="$style.header">
                              <span>状态：</span>
                              <u-switch
                                v-model="inputsModel.enable"
                                :with-text="true"
                              />
                            </div>
                            <kube-dynamic-block
                              v-if="inputsModel.enable"
                              v-model="inputsModel.config"
                              style="width: 100%"
                              :prefix-key="inputsModel.receiver"
                              :layout-comp="blockLayout"
                              :row-comp="blockRowLayout"
                              :column-comp="null"
                              :data-template="() => getDataTemplate(inputsModel.receiver)"
                              button-name="添加"
                            >
                              <template slot-scope="{ model: row, index }">
                                <kube-form v-if="inputsModel.receiver === 'wechatConfigs'">
                                  <kube-form-item
                                    label="是否接受告警恢复通知"
                                    label-size="large"
                                  >
                                    <u-checkbox
                                      v-model="row.send_resolved"
                                    />
                                  </kube-form-item>
                                  <validation-provider
                                    v-slot="{ errors }"
                                    :name="`${errorPrefix}-wechatConfigs-${index}-to`"
                                    :rules="{
                                      acceptOne: {
                                        values: [row.to_user, row.to_party, row.to_tag]
                                      }
                                    }"
                                  >
                                    <kube-form-item
                                      label="企业微信用户名"
                                      layout="list"
                                      :message="row.to_user && errors && errors[0]"
                                    >
                                      <u-input
                                        v-model="row.to_user"
                                        :color="row.to_user && errors && errors[0] ? 'error' : ''"
                                        size="huge"
                                      />
                                    </kube-form-item>
                                    <kube-form-item
                                      label="企业微信用户组"
                                      layout="list"
                                      :message="row.to_party && errors && errors[0]"
                                    >
                                      <u-input
                                        v-model="row.to_party"
                                        :color="row.to_party && errors && errors[0] ? 'error' : ''"
                                        size="huge"
                                      />
                                    </kube-form-item>
                                    <kube-form-item
                                      label="企业微信用户标签"
                                      layout="list"
                                      :message="row.to_tag && errors && errors[0]"
                                    >
                                      <u-input
                                        v-model="row.to_tag"
                                        :color="row.to_tag && errors && errors[0] ? 'error' : ''"
                                        size="huge"
                                      />
                                    </kube-form-item>
                                  </validation-provider>
                                </kube-form>
                                <kube-form v-if="inputsModel.receiver === 'webhookConfigs'">
                                  <kube-form-item
                                    label="是否接受告警恢复通知"
                                    label-size="large"
                                  >
                                    <u-checkbox
                                      v-model="row.send_resolved"
                                    />
                                  </kube-form-item>
                                  <validation-provider
                                    v-slot="{ errors }"
                                    :name="`${errorPrefix}-webhookConfigs-${index}-url`"
                                    rules="urlpattern"
                                  >
                                    <kube-form-item
                                      label="url"
                                      layout="list"
                                      :message="errors && errors[0]"
                                    >
                                      <u-input
                                        v-model="row.url"
                                        :color="errors && errors[0] ? 'error' : ''"
                                        size="huge"
                                      />
                                    </kube-form-item>
                                  </validation-provider>
                                  <kube-form-item
                                    label="max_alerts"
                                    layout="list"
                                  >
                                    <u-number-input
                                      v-model="row.max_alerts"
                                      :min="0"
                                    />
                                  </kube-form-item>
                                </kube-form>

                                <kube-form v-if="inputsModel.receiver === 'emailConfigs'">
                                  <kube-form-item
                                    label="是否接受告警恢复通知"
                                    label-size="large"
                                  >
                                    <u-checkbox
                                      v-model="row.send_resolved"
                                    />
                                  </kube-form-item>
                                  <validation-provider
                                    v-slot="{ errors }"
                                    :name="`${errorPrefix}-emailConfigs-${index}-to`"
                                  >
                                    <kube-form-item
                                      label="收件人邮箱"
                                      layout="list"
                                      :message="errors && errors[0]"
                                    >
                                      <u-input
                                        v-model="row.to"
                                        type="email"
                                        :color="errors && errors[0] ? 'error' : ''"
                                        size="huge"
                                      />
                                    </kube-form-item>
                                  </validation-provider>
                                </kube-form>
                              </template>
                            </kube-dynamic-block>
                          </div>
                        </template>
                      </kube-tab>
                    </kube-form-item>
                  </validation-provider>
                </kube-form>
              </template>
            </kube-tab>

            <kube-form-item>
              <u-linear-layout direction="horizontal">
                <u-button
                  @click="step-=1"
                >
                  上一步
                </u-button>
                <u-button
                  color="primary"
                  :disabled="invalid"
                  @click="step+=1"
                >
                  下一步
                </u-button>
              </u-linear-layout>
            </kube-form-item>
          </kube-form>
        </validation-observer>
      </u-step>
      <u-step title="告警通知策略">
        <validation-observer
          v-slot="{ invalid }"
        >
          <kube-form>
            <kube-form-item label="receiver">
              <u-select
                v-model="model.route.receiver"
                :data="model.receivers.map(c => ({text: c.name, value: c.name}))"
                size="huge"
              />
            </kube-form-item>

            <validation-provider
              v-slot="{ errors }"
              name="group_wait"
              rules="duration"
            >
              <kube-form-item
                :message="errors && errors[0]"
                label="group_wait"
              >
                <u-input
                  v-model="model.route.group_wait"
                  :color="errors && errors[0] ? 'error' : ''"
                  size="huge"
                />
              </kube-form-item>
            </validation-provider>

            <validation-provider
              v-slot="{ errors }"
              name="group_interval"
              rules="duration"
            >
              <kube-form-item
                :message="errors && errors[0]"
                label="group_interval"
              >
                <u-input
                  v-model="model.route.group_interval"
                  :color="errors && errors[0] ? 'error' : ''"
                  size="huge"
                />
              </kube-form-item>
            </validation-provider>
            <validation-provider
              v-slot="{ errors }"
              name="repeat_interval"
              rules="duration"
            >
              <kube-form-item
                :message="errors && errors[0]"
                label="repeat_interval"
              >
                <u-input
                  v-model="model.route.repeat_interval"
                  :color="errors && errors[0] ? 'error' : ''"
                  size="huge"
                />
              </kube-form-item>
            </validation-provider>
            <kube-form-item label="group_by">
              <input-tag
                v-model="model.route.group_by"
                :class="$style.inputtag"
              />
            </kube-form-item>
            <kube-form-item>
              <u-linear-layout direction="horizontal">
                <u-button
                  @click="step-=1"
                >
                  上一步
                </u-button>
                <u-button
                  color="primary"
                  :disbled="invalid"
                  @click="submit"
                >
                  确定
                </u-button>
              </u-linear-layout>
            </kube-form-item>
          </kube-form>
        </validation-observer>
      </u-step>
    </u-steps>
  </u-modal>
</template>

<script>
import { cloneDeep } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';
import { Modal } from '@micro-app/common/mixins';
import {
    toPlainObject as toGlobalAlertPlainObject,
    toK8SObject as toGlobalAlertManagerK8SObject,
    patchK8SObject as patchGlobalAlertManagerObject,
    MANGER_CONFIGS,
    getDefaultReceiver,
} from 'kubecube/k8s-resources/alarmmanagerconfigspec/global.js';
import blockLayout from 'kubecube/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubecube/component/common/kube-dynamic-block-layout/row.vue';
import InputTag from 'vue-input-tag';
const SECRET_NAMESPACE = 'kubecube-monitoring';

export default {
    components: {
        InputTag,
    },
    mixins: [ Modal ],
    data() {
        return {
            isEdit: false,
            model: null,
            cluster: null,
            secretModel: null,
            step: 0,

            blockLayout,
            blockRowLayout,
        };
    },
    methods: {
        open(item) {
            if (item.config) {
                this.model = item.config.configure;
                this.secretModel = item.config;
                this.cluster = item.cluster;
                this.isEdit = true;
            } else {
                const config = toGlobalAlertPlainObject({});
                this.model = config.configure;
                this.secretModel = config;
                this.cluster = item.cluster;
                this.isEdit = false;

            }
            this.show = true;
        },
        getDataTemplate(receiver) {
            return cloneDeep(MANGER_CONFIGS[receiver]);
        },
        getReceiverTemplate() {
            return getDefaultReceiver();
        },
        async submit() {
            if (this.isEdit) {
                const yaml = patchGlobalAlertManagerObject(this.secretModel);
                await workloadService.patchAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster.clusterName,
                        namespace: SECRET_NAMESPACE,
                        resource: 'secrets',
                        name: 'alertmanager-kubecube-monitoring-alertmanager',
                    },
                    data: yaml,
                });
            } else {
                const yaml = toGlobalAlertManagerK8SObject(this.secretModel);
                await workloadService.createAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster.clusterName,
                        namespace: SECRET_NAMESPACE,
                        resource: 'secrets',
                        name: 'alertmanager-kubecube-monitoring-alertmanager',
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

<style module>
.group + .group{
    margin-top: 20px;
}
.group {
    min-height: 400px;
}
.inputtag {
    width: 580px;
}
.inputtag > span{
    background-color: $brand-primary!important;
    color: #fff!important;
    border-color: $brand-primary!important;
}
.inputtag > span > a{
    color: #fff!important;
}
</style>
