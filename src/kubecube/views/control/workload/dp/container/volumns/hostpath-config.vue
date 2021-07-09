<template>
  <div>
    <kube-dynamic-block
      v-model="model"
      style="width: 580px"
      :data-template="getDataTemplate"
    >
      <template slot="column">
        <th>节点路径</th>
        <th>模式</th>
        <th>挂载目录</th>
      </template>
      <template slot-scope="{ model: item, index }">
        <td>
          <validation-provider
            v-slot="{ errors }"
            :name="`${errorprefix}path-${index}`"
            rules="startsWithSlash|ConsistofPath"
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
                v-model="item.path"
                size="huge"
                :color="errors && errors[0] ? 'error' : ''"
              />
            </kube-form-item>
          </validation-provider>
        </td>
        <td>
          <u-select
            v-model="item.pathType"
            dense
            :data="pathTypeList"
          />
        </td>
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
      </template>
    </kube-dynamic-block>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import volumnMixin from './volumn-mixin';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    data: () => ({
        resource: 'hostpath',
        pathTypeList: [
            { text: 'DirectoryOrCreate', value: 'DirectoryOrCreate' },
            { text: 'FileOrCreate', value: 'FileOrCreate' },
        ],
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-volume-hostpath-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                path: '',
                mountPath: '',
                pathType: 'DirectoryOrCreate',
            };
        },
    },
};
</script>

<style>

</style>
