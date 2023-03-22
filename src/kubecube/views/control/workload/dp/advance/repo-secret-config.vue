<template>
  <div>
    <el-form-item
      label="仓库密钥"
      layout="block"
    >
      <el-select v-model="model" multiple placeholder="请选择">
        <el-option
          v-for="item in repoSecrets"
          :key="item.value"
          :label="item.text"
          :value="item.value">
        </el-option>
      </el-select>
      <div>
        如需新的Secret，可
        <el-link
          type="primary"
          @click="openNewWindow({ path: '/control/secrets/list', query: $route.query })"
        >
          创建Secret
        </el-link>
        <i
          style="font-size:16px; margin-left: 8px"
          :class="loading ? 'el-icon-loading' : 'el-icon-refresh-right'"
          @click="update"
        />
      </div>
    </el-form-item>
  </div>
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
