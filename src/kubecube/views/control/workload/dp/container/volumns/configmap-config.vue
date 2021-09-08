<template>
  <div>
    <kube-dynamic-block
      v-model="model"
      style="width: 580px"
      :data-template="getDataTemplate"
    >
      <template slot="column">
        <th>ConfigMap名称</th>
        <th>
          items
          <u-note>通过 Items 将 ConfigMap 中的某个键值的内容挂载在数据卷中某个文件路径下</u-note>
        </th>
        <th>挂载目录</th>
        <th>子路径</th>
        <th>文件路径</th>
      </template>
      <template slot-scope="{ model: item, index }">
        <td>
          <u-select
            v-model="item.resource"
            :data="resources"
          />
        </td>
        <td>
          <u-select
            v-model="item.key"
            :data="getConfigMapKeyList(item.resource)"
          />
        </td>
        <td>
          <validation-provider
            v-slot="{ errors }"
            :name="`${errorprefix}mountPath-${index}`"
            :rules="{
              startsWithSlash: true,
              ConsistofPath: true,
              noRedundance: { list: allOtherMountPath }
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
          <validation-provider
            v-if="!item.key"
            v-slot="{ errors }"
            :name="`${errorprefix}subPath-${index}`"
            rules="ConsistofSubPath"
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
                v-model="item.subPath"
                size="huge"
                :color="errors && errors[0] ? 'error' : ''"
              />
            </kube-form-item>
          </validation-provider>
        </td>
        <td>
          <validation-provider
            v-if="item.key"
            v-slot="{ errors }"
            :name="`${errorprefix}filePath-${index}`"
            rules="ConsistofSubPath"
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
                v-model="item.filePath"
                :color="errors && errors[0] ? 'error' : ''"
                size="huge"
              />
            </kube-form-item>
          </validation-provider>
        </td>
      </template>
    </kube-dynamic-block>
    <div class="text-subtitle-2 mt-2">
      如需新的ConfigMap，可
      <u-link
        @click="openNewWindow({ path: '/control/configmaps/list', query: $route.query })"
      >
        创建ConfigMap
      </u-link>
      <u-refresh
        :loading="loading"
        @click="update"
      />
    </div>
  </div>
  <!-- </template>
  </x-request> -->
</template>

<script>
import { flatten } from 'lodash';
import { makeVModelMixin } from 'kubecube/mixins/functional';
import volumnMixin from './volumn-mixin';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    data: () => ({
        resource: 'configmaps',
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-volume-configmaps-`;
        },
        allOtherMountPath() {
            const otherVolumns = [];
            for (const key in this.volume) {
                if (key !== 'configmap') {
                    otherVolumns.push(this.volume[key]);
                }
            }
            const paths = flatten(otherVolumns.map(v => flatten(v.map(t => t.mountPath)))).filter(p => p);
            return paths;
        },
    },
    methods: {
        getConfigMapKeyList(resource) {
            const configmap = this.resources.find(r => r.value === resource);
            if (configmap) {
                return [
                    { text: '暂不选择', value: '' },
                    ...Object.keys(configmap.data).map(d => ({ text: d, value: d })),
                ];
            }
            return [];
        },
        getDataTemplate() {
            return {
                resource: '',
                mountPath: '',
                subPath: '',
                key: '',
                filePath: '',
            };
        },
    },
};
</script>

<style>

</style>
