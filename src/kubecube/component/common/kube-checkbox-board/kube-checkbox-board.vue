<template>
  <div :class="$style.card">
    <div :class="$style.head">
      <u-checkbox
        v-model="checkedAll"
        :disabled="data.length===0"
      >
        全选
      </u-checkbox>
    </div>
    <div :class="$style.body">
      <u-checkboxes
        v-if="data.length > 0"
        v-model="model"
      >
        <div
          v-for="item in data"
          :key="item.value"
          :class="$style.item"
        >
          <u-checkbox
            :label="item.value"
            :title="item.text"
            :disabled="!!item.disabled"
          >
            {{ item.text }}
          </u-checkbox>
        </div>
      </u-checkboxes>
      <p
        v-else
        :class="$style.placeholder"
      >
        {{ placeholder }}
      </p>
    </div>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
export default {
    name: 'KubeCheckboxBoard',
    mixins: [ makeVModelMixin ],
    props: {
        placeholder: {
            type: String,
            default: '',
        },
        data: {
            type: Array,
            default() { return []; },
        },
    },
    computed: {
        checkedAll: {
            get() {
                return this.model.length === this.data.length && this.data.length > 0;
            },
            set(val) {
                const disabledValues = this.model.filter(d => this.data.find(p => p.disabled && (p.value === d)));
                if (val) {
                    this.model = [ ...disabledValues, ...this.data.filter(d => !d.disabled).map(d => d.value) ];
                } else {
                    this.model = disabledValues;
                }
            },
        },
    },
};
</script>

<style module>
.card{
    max-width: 100%;
    width: 580px;
    max-height: 360px;
    overflow-y: auto;
    border: 1px solid #e1e8ed;
}
.head{
    padding: 5px 10px;
    height: 41px;
    line-height: 30px;
    border-bottom: 1px solid #e1e8ed;
    background-color: #eef2f5;
}
.body{
    max-height: 318px;
    overflow: auto;
    padding: 10px 10px;
    padding-bottom: 5px;
}
.item{
    display: inline-block;
    width: 33%;
    padding-right: 20px;
    margin-right: 0px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.placeholder{
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin: 0px;
    color: rgb(153, 153, 153);
}
</style>
