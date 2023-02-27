<template>
  <section :class="$style.container">
    <template v-for="(item, index) in $slots.default">
      <qz-link-simple
        v-if="isPre(index) && item.context"
        :key="index"
        :link="item"
        :has-more="hasMore()"
      />
    </template>
    <el-dropdown
      v-if="hasMore()"
      :class="$style.more"
    >
      <el-button
        v-if="isButton"
        :size="buttonSize"
        :type="moreType"
      >
        更多<i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-link
        v-else
        :type="moreType"
        :underline="false"
      >
        更多<i class="el-icon-arrow-down el-icon--right" />
      </el-link>
      <el-dropdown-menu slot="dropdown">
        <template v-for="(item, index) in $slots.default">
          <qz-link-more
            v-if="!isPre(index) && item.context"
            :key="index"
            :link="item"
            :is-button="isButton"
          />
        </template>
      </el-dropdown-menu>
    </el-dropdown>
  </section>
</template>
<script>
import QzLinkSimple from './qz-link-simple';
import QzLinkMore from './qz-link-more';
export default {
    name: 'QzLinkGroup',
    components: {
        'qz-link-simple': QzLinkSimple,
        'qz-link-more': QzLinkMore,
    },
    props: {
        max: {
            type: [ Number, String ],
            default: 3,
        },
        isButton: {
            type: Boolean,
            default: false,
        },
        buttonSize: {
            type: String,
            default: '',
        },
        moreType: {
            type: String,
            default: 'primary',
        },
    },
    computed: {
        maxInner() {
            return (Number(this.max) > 1 && Number(this.max)) || 3;
        },
    },
    methods: {
        hasMore() {
            if (
                this.emptyNodeList().length + Number(this.maxInner) >=
                (this.$slots.default || []).length
            ) {
                return false;
            }
            return (
                (this.$slots.default || []).length >
                Number(this.maxInner) + this.beforeMaxEmptyNodeLength()
            );
        },
        emptyNodeList() {
            const list = [];
            (this.$slots.default || []).forEach((item, index) => {
                if (!item.context) {
                    list.push(index);
                }
            });
            return list;
        },
        beforeMaxEmptyNodeLength() {
            return (this.emptyNodeList() || []).filter(index => {
                return index < Number(this.maxInner);
            }).length;
        },
        isPre(index) {
            return this.hasMore()
                ? this.maxInner - 1 + this.beforeMaxEmptyNodeLength() > index
                : true;
        },
    },
};
</script>
<style module>
.container {
    display: inline-block;
}
.link {
    cursor: pointer;
    color: var(--color-primary);
    vertical-align: middle;
}
.more a {
    vertical-align: baseline;
}
</style>
