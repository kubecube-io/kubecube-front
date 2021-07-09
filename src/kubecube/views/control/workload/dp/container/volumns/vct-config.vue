<template>
  <div>
    <kube-dynamic-block
      v-model="model"
      style="width: 580px"
      :data-template="getDataTemplate"
    >
      <template slot="column">
        <th>挂载目录</th>
        <th>参数</th>
      </template>
      <template slot-scope="{ model: item, index }">
        <td>
          <validation-provider
            v-slot="{ errors }"
            :name="`${errorprefix}mountPath-${index}`"
            :rules="{
              startsWithSlash: true,
              ConsistofPath: true,
              noRedundance: { list: allMountPath }
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
                v-model="item.mountPath"
                size="huge"
                :color="errors && errors[0] ? 'error' : ''"
              />
            </kube-form-item>
          </validation-provider>
        </td>
        <td>
          <u-select
            v-model="item.name"
            size="huge"
            :data="vcts"
          />
        </td>
      </template>
    </kube-dynamic-block>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import volumnMixin from './volumn-mixin';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    props: {
        storage: Array,
    },
    computed: {
        errorprefix() {
            return `${this.prefixKey}-volume-vct-`;
        },
        vcts() {
            return this.storage.map(v => ({
                text: v.name,
                value: v.name,
            }));
        },
    },
    methods: {
        getDataTemplate() {
            return {
                name: '',
                mountPath: '',
            };
        },
    },
};
</script>

<style>

</style>
