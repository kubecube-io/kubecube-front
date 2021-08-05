<template>
  <div
    :class="$style.root"
    :mini="mini"
  >
    <validation-observer
      ref="observer"
      v-slot="{ errors, invalid }"
    >
      <div
        v-show="mini"
        @click="open"
      >
        <span
          :class="$style.rootName"
          :title="titleKey && value[titleKey]"
        >
          {{ (titleKey && value[titleKey]) || `配置 - ${index}` }}
        </span>
        <div :class="$style.textWrap">
          <!-- 错误提示 -->
          <span
            v-if="invalid"
            :class="$style.tip"
          >
            {{ getTip(errors) }}</span>
          <!-- 展开操作 -->
          <u-link @click.stop="open">
            展开
          </u-link>
        </div>
      </div>
      <div v-show="!mini">
        <div :class="$style.operate">
          <u-linear-layout>
            <u-link
              :disabled="disabled"
              @click="remove"
            >
              删除
            </u-link>
            <u-link @click="close">
              收起
            </u-link>
          </u-linear-layout>
        </div>
        <slot />
      </div>
    </validation-observer>
  </div>
</template>

<script>
export default {
    inject: [ 'rowmeta', 'changeCurrentBlock' ],
    props: {
        value: Object,
        index: Number,
        titleKey: String,
        disabled: Boolean,
    },
    data() {
        return {
            mini: this.index !== this.rowmeta.currentBlock,
        };
    },
    watch: {
        rowmeta: {
            handler(val) {
                this.mini = this.index !== val.currentBlock;
            },
            deep: true,
        },
        mini(val) {
            if (val) {
                this.$refs.observer.validate();
            }
        },
    },
    mounted() {
        if (this.mini) {
            this.$refs.observer.validate();
        }
    },
    methods: {
        remove() {
            this.$emit('remove');
        },
        close() {
            this.mini = true;
        },
        open() {
            if (this.rowmeta.currentBlock === this.index) {
                this.mini = false;
            } else {
                this.changeCurrentBlock(this.index);
            }

        },
        getTip(errors) {
            const k = Object.keys(errors).find(key => {
                const err = errors[key];
                return err.length > 0;
            });
            if (k) {
                return errors[k][0];
            }
            return '';
        },
    },
};
</script>

<style module>
.root{
	position: relative;
    padding: 40px 15px;
    border: 1px solid #e1e8ed;
    margin-bottom: 20px;
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
    max-width: calc(100% - 180px);
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

    right: 16px;
    position: relative;

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
