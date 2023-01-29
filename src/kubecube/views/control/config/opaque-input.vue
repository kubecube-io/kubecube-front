<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
          {
              title: 'Key',
              dataIndex: 'key',
          },
          {
              title: 'Value',
              dataIndex: 'value',
          }
      ]"
    >
      <template v-slot:key="{record: dataModel, index: dataIndex}">
        <el-form-item 
          label=""
          :prop="`${prefixProp}.${dataIndex}.key`"
          :rules="[
            validators.consistofNormalSymbol(false),
          ]"
        >
          <el-input v-model="dataModel.key" placeholder="Key 由数字、字母、'-'、 '_' 或'.'组成"/>
        </el-form-item>
      </template>
      <template v-slot:value="{record: dataModel}">
        <el-input v-model="dataModel.value"/>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import dynamicBlock from 'kubecube/elComponent/dynamic-block/index.vue';
import * as validators from 'kubecube/utils/validators';
export default {
    components: {
      dynamicBlock
    },
    props: {
      prefixProp: {
        type: String,
        default: ''
      }
    },
    mixins: [ makeVModelMixin ],
    data() {
      return {
        validators,
      }
    },
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
