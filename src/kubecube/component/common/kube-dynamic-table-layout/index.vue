<template>
  <div
    :class="$style.root"
    :size="size"
  >
    <table :class="$style.table">
      <thead>
        <slot
          name="head"
        />
      </thead>
      <tbody :nohead="!$slots.head">
        <slot
          name="body"
        />
      </tbody>
    </table>
    <u-button
      v-if="showButton"
      :class="$style.addBtn"
      :disabled="disabled"
      @click="add"
    >
      添加
    </u-button>
  </div>
</template>

<script>
export default {
    props: {
        size: {
            type: String,
            default: 'normal',
        },
        showButton: {
            type: Boolean,
            default: true,
        },
        disabled: Boolean,
    },
    methods: {
        add() {
            this.$emit('add');
        },
    },
};
</script>

<style module>
.root[size="normal"]{
    width: 722px;
}
.table{
    table-layout: fixed;
    width: 100%;
    margin-bottom: 20px;
}
.table thead{
    color: #666;
    line-height: 40px;
    border-bottom: 1px solid #e1e8ed;
}
.table thead th{
    position: relative;
    font-weight: normal;
    text-align: left;
    height: 48px;
    font-size: 14px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    padding: 0 5px
}
.table tbody[nohead] tr:first-child td {
    padding-top: 0;;
}
.table tbody td{
    padding-top: 20px;
    padding-right: 10px;
}

.table tbody td:last-child{
    padding-right: 0px;
}
.addBtn{
    font-size: 14px;
    width: 100%;
    padding: 0 30px;
    margin: 0;
    overflow: visible;
    font: inherit;
    text-transform: none;
    text-decoration: none;
    cursor: pointer;
    box-sizing: border-box;
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    height: 40px;
    line-height: 40px;
    width: 100%;
    background: #fbfcfc;
    border: 1px solid #e1e8ed;
    color: #5494db;
    outline:none;
}
.addBtn:hover {
    color: #67aaf5;
    text-decoration: none;
    border: 1px solid #e1e8ed;
    box-shadow: 0 0 8px rgba(13,4,8,0.1);
}
.addBtn[disabled] {
    background: #fff;
    color: #ccc;
    border: 1px solid #ddd;
}
.addBtn[disabled]:hover {
    box-shadow: 0 0 0 transparent;
    cursor: not-allowed;
}

.addBtn[isContainer] {
    background: #fff;
    height: 56px;
    line-height: 56px;
}
</style>
