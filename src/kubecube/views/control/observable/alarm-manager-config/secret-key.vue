<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 578px"
    :data-template="getDataTemplate"
  >
    <template slot="column">
      <th width="33.33333%">
        Name
      </th>
      <th width="33.3333%">
        Key
      </th>
      <th width="33.33333%">
        Optional
      </th>
    </template>
    <template slot-scope="{ model }">
      <td>
        <u-input
          v-model="model.name"
          size="normal huge"
          placeholder="key of select secret"
        />
      </td>
      <td>
        <u-input
          v-model="model.key"
          size="normal huge"
          placeholder="secret name"
        />
      </td>
      <td>
        <u-select
          v-model="model.optional"
          size="normal huge"
          :data="[
            { text: 'True', value: true },
            { text: 'False', value: false },
          ]"
        />
      </td>
    </template>
  </kube-dynamic-block>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
export default {
    mixins: [ makeVModelMixin ],
    // computed: {
    //     exsitKeys() {
    //         return this.model.map(t => t.key);
    //     },
    // },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                name: '',
                optional: false,
            };
        },
    },
};
</script>

<style module>
.wrap {
    position: relative;

}
.wrap:hover > .zoom {
    display: block;
}
.wrap[readonly]:hover > .zoom {
    display: none;
}

.textarea[class] {
    width: 100%;
    height: 40px;
    line-height: 28px;
}
.textarea[isExpand] {
    height: 150px;
}

.zoom {
    display: none;
    position: absolute;
    top: 9px;
    right: 10px;
    color: #9ba4ad;
}
.zoom:before {
    icon-font: url(@micro-app/common/assets/icons/svg/apm-extend.svg);
}
.zoom[isExpand]:before {
    icon-font: url(@micro-app/common/assets/icons/svg/apm-small.svg);
}
</style>
