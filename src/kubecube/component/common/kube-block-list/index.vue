<template>
  <div
    :class="$style.root"
    :mini="mini"
  >
    <div
      v-show="mini"
      @click="open"
    >
      <span
        :class="$style.rootName"
      >
        <slot name="breif" />
      </span>
      <div :class="$style.textWrap">
        <!-- 展开操作 -->
        <u-link @click="open">
          展开
        </u-link>
      </div>
    </div>
    <div v-show="!mini">
      <div :class="$style.operate">
        <u-linear-layout>
          <u-link @click="close">
            收起
          </u-link>
        </u-linear-layout>
      </div>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            mini: true,
        };
    },
    methods: {
        close() {
            this.mini = true;
        },
        open() {
            this.mini = false;
        },
    },
};
</script>

<style module>
.root{
	position: relative;
    padding: 40px 15px;
    border: 1px solid #e1e8ed;
    margin-top: 20px;
}
.root[size="normal"]{width:800px;}
.root[size="small"] {width: 700px;}
.root[size="affinity"] {width: 630px;}
.addButton[size="affinity"] {width: 630px;}

.root[mini]:hover {
    box-shadow: 0 0 10px 0 rgb(80, 90, 109, .16);
    cursor: pointer;
}

.root[mini] {
    padding: 0 15px;
    background: #f6f7fb;
    padding: 13px 5px 13px 10px;
}


.root[noborder] {
    border: 0;
    padding: 0;
}
.operate {
    position: absolute;
    top: 13px;
    right: 20px;
}

.rootName {
    margin-left: 10px;
    display: inline-block;
    line-height: 30px;
    max-width: calc(100% - 80px);
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.desc {
    display: inline-block;
    max-width: 580px;
    color: #999;
    padding-bottom: 10px;
}

.textWrap {
    float: right;
    line-height: 30px;
    margin-right: 20px;
}

.tip {
    display: inline-block;
    margin-right: 40px;
    color: #ff867f;
}

.more {
    margin-left: 45px;
}
</style>
