<template>
  <kube-form-item
    label="仓库密钥"
    layout="block"
  >
    <u-multi-select
      v-model="model"
      :data="repoSecrets"
      size="large full"
      style="width: 750px;"
    />
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
  </kube-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import volumnMixin from 'kubecube/views/control/workload/dp/container/volumns/volumn-mixin.js';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    data() {
        return {
            resource: 'secrets',
        };
    },
    computed: {
        repoSecrets() {
            return this.resources.filter(i => i.type === 'kubernetes.io/dockerconfigjson');
        },
    },
};
</script>

<style>

</style>
