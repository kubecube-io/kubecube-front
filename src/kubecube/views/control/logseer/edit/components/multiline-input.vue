<template>
  <table-layout
    :show-button="false"
    style="width: 100%"
  >
    <template slot="head">
      <th>Pattern</th>
      <th>Negate</th>
      <th>Match</th>
    </template>
    <template slot="body">
      <td>
        <u-input
          v-model="model.pattern"
          size="huge"
        />
      </td>
      <td>
        <u-select
          v-model="model.negate"
          size="huge"
        >
          <u-select-item :value="true">
            true
          </u-select-item>
          <u-select-item :value="false">
            false
          </u-select-item>
        </u-select>
      </td>
      <td>
        <u-select
          v-model="model.match"
          size="huge"
        >
          <u-select-item value="before">
            before
          </u-select-item>
          <u-select-item value="after">
            after
          </u-select-item>
        </u-select>
      </td>
    </template>
  </table-layout>
</template>

<script>
import tableLayout from 'kubecube/component/common/kube-dynamic-table-layout/index.vue';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
export default {
    components: {
        'table-layout': tableLayout,
    },
    mixins: [ makeVModelMixin ],
};
</script>

<style>

</style>
