<template>
  <!-- <x-request
    ref="request"
    :service="resourceService"
    :params="params"
    :processor="resourceResolver"
  >
    <template slot-scope="{ loading }"> -->
  <div>
    <kube-dynamic-block
      v-model="model"
      style="width: 580px"
      :data-template="getDataTemplate"
    >
      <template slot="column">
        <th>secret名</th>
        <th>挂载目录</th>
        <th>子路径</th>
      </template>
      <template slot-scope="{ model: item, index }">
        <td>
          <u-select
            v-model="item.resource"
            dense
            :data="resources"
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
        <td>
          <validation-provider
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
      </template>
    </kube-dynamic-block>
    <div class="text-subtitle-2 mt-2">
      如需新的Secret，可
      <u-link
        @click="openNewWindow({ path: '/control/secrets/list', query: $route.query })"
      >
        创建Secret
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
import { makeVModelMixin } from 'kubecube/mixins/functional';
import volumnMixin from './volumn-mixin';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    data: () => ({
        resource: 'secrets',
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-volume-secrets-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                resource: '',
                mountPath: '',
                subPath: '',
            };
        },
    },
};
</script>

<style>

</style>
