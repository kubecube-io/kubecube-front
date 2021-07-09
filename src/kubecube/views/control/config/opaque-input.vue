<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 578px"
    :data-template="getDataTemplate"
  >
    <template slot="column">
      <th width="33.3333%">
        Key
      </th>
      <th width="66.6666%">
        Value
      </th>
    </template>
    <template slot-scope="{ model, index }">
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`Key-${index}`"
          rules="ConsistofNormalSymbol"
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
              v-model="model.key"
              size="normal huge"
              placeholder="Key 由数字、字母、'-'、 '_' 或'.'组成"
              :disabled="model.disabled"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
      </td>
      <td>
        <div
          :class="$style.wrap"
        >
          <u-textarea
            v-model="model.value"
            :class="$style.textarea"
            resize="none"
          />
        </div>
      </td>
    </template>
  </kube-dynamic-block>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
export default {
    mixins: [ makeVModelMixin ],
    computed: {
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                value: '',
                disabled: false,
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
