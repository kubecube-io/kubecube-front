<template>
  <validation-provider
    ref="provider"
    :name="`HOST-Path-${index}`"
    :detect-input="false"
    :rules="{
      arrayRequired: {
        filterkey: ['path', 'service', 'port']
      },
    }"
  >
    <kube-form-item
      label="路径"
      layout="block"
      required
    >
      <kube-dynamic-block
        v-model="model"
        style="width: 100%;"
        :data-template="getDataTemplate"
      >
        <template slot="column">
          <th>
            Path
          </th>
          <th>服务</th>
          <th>
            端口
          </th>
        </template>
        <template slot-scope="{ model, index: idx }">
          <td>
            <validation-provider
              v-slot="{ errors }"
              :name="`HOST-Path-${index}-${idx}`"
              :rules="{
                required: true,
                startsWithSlash: true,
                ConsistofPath: true,
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
                  v-model="model.path"
                  size="normal huge"
                  :color="errors && errors[0] ? 'error' : ''"
                  placeholder="请输入路径或者正则"
                />
              </kube-form-item>
            </validation-provider>
          </td>
          <td>
            <validation-provider
              v-slot="{ errors }"
              :name="`HOST-service-${index}-${idx}`"
              :rules="{
                required: true,
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
                <u-suggest
                  v-model="model.service"
                  size="huge"
                  placeholder="请选择"
                  :data="serviceList"
                />
              </kube-form-item>
            </validation-provider>
          </td>
          <td>
            <validation-provider
              v-slot="{ errors }"
              :name="`HOST-port-${index}-${idx}`"
              :rules="{
                required: true,
                ConsistofNumber: true,
                NumberBetween: { min: 1, max: 65535 },
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
                  v-model="model.port"
                  size="normal huge"
                  :color="errors && errors[0] ? 'error' : ''"
                  placeholder="1-65535内的整数"
                />
              </kube-form-item>
            </validation-provider>
          </td>
        </template>
      </kube-dynamic-block>
    </kube-form-item>
  </validation-provider>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        index: Number,
        defaultService: {
            type: String,
            default: '',
        },
        serviceList: Array,
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                path: '',
                service: this.defaultService,
                port: '',
            };
        },
    },
};
</script>

<style>

</style>
