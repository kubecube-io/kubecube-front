<template>
  <u-modal
    title="设置污点"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="large"
    @close="close"
  >
    <u-text>污点（taint），只有拥有和 taint 相匹配的 toleration 的 pod 才能够被分配到节点。</u-text>
    <validation-observer
      ref="observer"
      v-slot="{ errors, invalid }"
    >
      <u-form
        ref="form"
        gap="large"
        layout="block"
      >
        <kube-dynamic-block
          v-model="model"
          style="width: 100%;"
          :data-template="getDataTemplate"
        >
          <template slot="column">
            <th>Key</th>
            <th>Value</th>
            <th>
              Effect<u-note>
                <div>NoSchedule：POD 不会被调度到标记为 taints 节点。</div>
                <div>PreferNoSchedule：NoSchedule 的软策略版本。尽量避免将 pod 调度到存在其不能容忍 taint 的节点上</div>
                <div>NoExecute：该选项意味着一旦 Taint 生效，如该节点内正在运行的 POD 没有对应 Tolerate 设置，会直接被逐出。</div>
              </u-note>
            </th>
          </template>
          <template slot-scope="{ model, index }">
            <td>
              <validation-provider
                v-slot="{ errors }"
                :name="`Key-${index}`"
                :rules="{
                  KeyPattern: true,
                  noRedundance: { list: exsitKeys }
                }"
              >
                <kube-form-item
                  muted="no"
                  style="width: 100%;"
                  field-size="full"
                  layout="none"
                  :message="errors && errors[0]"
                  placement="bottom"
                >
                  <u-input
                    v-model="model.key"
                    size="normal huge"
                    :color="errors && errors[0] ? 'error' : ''"
                  />
                </kube-form-item>
              </validation-provider>
            </td>

            <td>
              <validation-provider
                v-slot="{ errors }"
                :name="`Value-${index}`"
                :rules="{
                  dependOnPattern: { depend: model.key }
                }"
              >
                <kube-form-item
                  muted="no"
                  style="width: 100%;"
                  field-size="full"
                  layout="none"
                  :message="errors && errors[0]"
                  placement="bottom"
                >
                  <u-input
                    v-model="model.value"
                    size="normal huge"
                    :color="errors && errors[0] ? 'error' : ''"
                  />
                </kube-form-item>
              </validation-provider>
            </td>
            <td>
              <u-select
                v-model="model.effect"
                size="huge"
                :data="effects"
              />
            </td>
          </template>
        </kube-dynamic-block>
        <u-submit-button
          ref="submit"
          :click="submit.bind(this)"
          place="right"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                :disabled="scope.submitting || invalid"
                :icon="scope.submitting ? 'loading' : null "
                color="primary"
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
      </u-form>
    </validation-observer>
  </u-modal>
</template>

<script>
import { get, cloneDeep } from 'lodash';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubecube/services/k8s-resource';
export default {
    mixins: [ Modal ],
    props: {
        instance: Object,
    },
    data() {
        return {
            effects: [ 'NoSchedule', 'PreferNoSchedule', 'NoExecute' ].map(item => ({ text: item, value: item })),
            model: [],
            raw: null,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    methods: {
        open(item) {
            console.log(item);
            const taint = get(item, 'spec.taints', []);
            this.model = cloneDeep(taint);
            this.raw = item;
            this.show = true;
        },
        getDataTemplate() {
            return {
                key: '',
                value: '',
                effect: 'NoSchedule',
            };
        },
        async submit() {
            const data = { spec: { taints: this.model } };
            await workloadService.modifyResourceWithoutNamespace({
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'nodes',
                    name: get(this.raw, 'metadata.name'),
                },
                data,
            });
            this.show = false;
            this.$emit('refresh');
        },
    },
};
</script>

<style>

</style>
