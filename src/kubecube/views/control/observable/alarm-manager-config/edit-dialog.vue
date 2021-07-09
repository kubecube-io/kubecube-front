<template>
  <u-modal
    :title="isEdit ? '编辑告警策略组' : '创建告警策略组'"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="huge"
    @close="close"
  >
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <kube-form>
        <kube-name-input
          v-model="model.metadata.name"
          :disabled="isEdit"
        />
        <validation-provider
          v-slot="{ errors }"
          name="receivers"
          :rules="{
            someRequired: {list: enableState}
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
              v-model="model.spec.receivers"
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
                    :data-template="() => configTemplate[inputsModel.receiver]"
                    button-name="添加"
                  >
                    <template slot-scope="{ model: row, index }">
                      <template v-for="meta in getTextUI(row)">
                        <validation-provider
                          :key="`${index}-${meta.key}`"
                          v-slot="{ errors }"
                          :name="`${index}-${meta.key}`"
                          :rules="{
                            urlpattern: ['apiURL', 'url'].includes(meta.key),
                          }"
                        >
                          <kube-form-item

                            :label="meta.key"
                            :message="errors && errors[0]"
                            layout="list"
                          >
                            <u-textarea
                              v-if="meta.ui === 'textarea'"
                              v-model="row[meta.key]"
                              :color="errors && errors[0] ? 'error' : ''"
                              size="huge"
                            />
                            <u-input
                              v-else
                              v-model="row[meta.key]"
                              :type="['to', 'from'].includes(meta.key) ? 'email' : 'text'"
                              :color="errors && errors[0] ? 'error' : ''"
                              size="huge"
                            />
                          </kube-form-item>
                        </validation-provider>
                      </template>
                    </template>
                  </kube-dynamic-block>
                  <!-- <template v-if="model.spec.receivers[channel].enable">

                  </template> -->
                </div>
              </template>
            </kube-tab>
          </kube-form-item>
        </validation-provider>

        <u-submit-button
          :click="submit.bind(this)"
          place="right"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                确定
              </u-button>
              <u-button @click="close">
                取消
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form>
    </validation-observer>
  </u-modal>
</template>

<script>
// import { get as getFunc, cloneDeep, omit } from 'lodash';
import { get } from 'vuex-pathify';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubecube/services/k8s-resource';
import blockLayout from 'kubecube/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubecube/component/common/kube-dynamic-block-layout/row.vue';
import {
    toPlainObject as toAMCSPlainObject,
    toK8SObject as toAMCSK8SObject,
    patchK8SObject as patchAMCSK8SObject,
    CONFIGS as configTemplate,
} from 'kubecube/k8s-resources/alarmmanagerconfigspec';
import {
    specCRD,
} from '../utils';
const textArea = [ 'apiSecret', 'apiSecret', 'url', 'urlSecret', 'text' ];
export default {
    mixins: [ Modal ],
    data() {
        console.log(configTemplate);
        return {
            model: toAMCSPlainObject(),
            isEdit: false,
            initStorage: 0,
            configTemplate,
            blockLayout,
            blockRowLayout,
        };
    },
    computed: {
        namespace: get('scope/project@spec.namespace'),
        cluster: get('scope/cluster@value'),
        tenant: get('scope/tenant@value'),
        project: get('scope/project@value'),
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    ...specCRD,
                },
            };
        },
        enableState() {
            return this.model.spec.receivers.map(c => c.enable);
        },
    },
    methods: {
        getTextUI(config) {
            const ui = [];
            Object.keys(config).forEach(k => {
                if (k !== 'enable') {

                    ui.push({
                        key: k,
                        ui: textArea.includes(k) ? 'textarea' : 'input',
                    });

                }
            });
            return ui;
        },
        async open(item) {
            if (item) {
                this.isEdit = true;
                const response = await workloadService.getNamespaceCRResourceInstance({
                    pathParams: {
                        ...this.params.pathParams,
                        name: item.metadata.name,
                    },
                });
                this.model = toAMCSPlainObject(response);

            } else {
                this.model = toAMCSPlainObject();
            }
            this.show = true;
        },
        async submit() {
            if (this.isEdit) {
                const yaml = patchAMCSK8SObject(this.model, this.tenant, this.project);
                await workloadService.patchNamespaceCRResourceInstance({
                    pathParams: {
                        ...this.params.pathParams,
                        name: this.model.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = toAMCSK8SObject(this.model, this.tenant, this.project);
                await workloadService.createNamespaceCRResource({
                    pathParams: this.params.pathParams,
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
.header{
    width: 580px;
    padding: 10px;
    background-clip: padding-box;
}
/* .wrapper {
    max-height: 300px;
    overflow-y: scroll;
} */
</style>
