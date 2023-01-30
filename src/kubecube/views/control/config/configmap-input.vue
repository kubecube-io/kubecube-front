<template>
  <div>
    <div
      v-for="(item, index) in model"
      :key="index"
      :class="$style.itemWrap"
    >
      <div :class="$style.itemHead">
        <div :class="$style.itemTitle">
          数据{{ index + 1 }}
        </div>
        <div :class="$style.itemActionBox">
          <el-link
            type="primary"
            @click="handleDeleteItem(index)"
          >
            删除
          </el-link>
        </div>
      </div>
      <div :class="$style.itemBody">
        <el-form-item
          label="Key"
          :prop="`${prefixProp}.${index}.key`"
          :rules="[
            validators.consistofNormalSymbol(false)
          ]"
          label-width="100px"
          style="margin-bottom: 24px"
        >
          <el-input
            v-model="item.key"
            placeholder="Key 由数字、字母、'-'、 '_' 或'.'组成"
          />
        </el-form-item>
        <el-form-item
          label="Value"
          label-width="100px"
        >
          <kubeEditor
            v-model="item.value"
            style="border: 1px solid #E1E8ED"
            height="160"
            theme="vs"
            language="yaml"
            :options="{ minimap: {enabled: false} }"
          />
        </el-form-item>
      </div>
    </div>
    <div :class="$style.addBtnWrap">
      <el-button
        :class="$style.addBtn"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        添加
      </el-button>
    </div>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import * as validators from 'kubecube/utils/validators';
import kubeEditor from 'kubecube/elComponent/kubeEditor';
export default {
    components: {
        kubeEditor,
    },
    mixins: [ makeVModelMixin ],
    props: {
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            validators,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    created() {
        if (this.model.length === 0) {
            this.model.push(this.getDataTemplate());
        }
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                value: '',
                disabled: false,
            };
        },
        handleAdd() {
            this.model.push(this.getDataTemplate());
        },
        handleDeleteItem(index) {
            this.model.splice(index, 1);
            if (this.model.length === 0) {
                this.model.push(this.getDataTemplate());
            }
        },
    },
};
</script>

<style module>
.itemWrap {
    margin-bottom: 12px;
    border: 1px solid #e1e8ed;
    width: 100%px;
}
.itemHead {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;
    background: #E5E5E5;
    padding: 0 16px;
}
.itemTitle {

}
.itemActionBox {

}
.itemBody {
    padding: 24px;
}
.addBtnWrap{

}
.addBtn{
    width: 100%;
}
</style>
