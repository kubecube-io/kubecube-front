<template>
  <div>
    <kube-dynamic-block
      v-model="model"
      style="width: 580px"
      :data-template="getDataTemplate"
    >
      <template slot="column">
        <th>名称</th>
        <th>权限</th>
        <th>挂载目录</th>
      </template>
      <template slot-scope="{ model: item, index }">
        <td>
          <u-select
            v-model="item.resource"
            dense
            :data="volumeResources"
          />
        </td>
        <td>
          <u-select
            v-model="item.readOnly"
            dense
            :data="readOnlyList"
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
    <div class="text-subtitle-2 mt-2">
      如需新的EmptyDir，可
      <u-link
        @click="openDialog"
      >
        创建EmptyDir
      </u-link>
    </div>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import volumnMixin from './volumn-mixin';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    props: {
        podVolumes: Object,
        openDialog: Function,
    },
    data: () => ({
        resource: 'emptydir',
        readOnlyList: [
            { text: 'ReadAndWrite', value: false },
            { text: 'Readonly', value: true },
        ],
    }),
    computed: {
        volumeResources() {
            return this.podVolumes.emptyDir.map(dir => ({
                text: dir.name,
                value: dir.name,
            }));
        },
        errorprefix() {
            return `${this.prefixKey}-volume-emptydir-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                resource: '',
                readOnly: false,
                mountPath: '',
            };
        },
    },
};
</script>

<style>

</style>
