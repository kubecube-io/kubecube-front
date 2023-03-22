<template>
  <a
    :class="[
      'el-link',
      type ? `el-link--${type}` : '',
      linkSize ? 'el-link--' + linkSize : '',
      disabled && 'is-disabled',
      underline && !disabled && 'is-underline',
    ]"
    :href="disabled ? null : linkHref"
    v-bind="$attrs"
    @click="handleClick"
  >

    <i
      v-if="icon"
      :class="icon"
    />
    <span
      v-if="$slots.default"
      class="el-link--inner"
    >
      <slot />
    </span>

    <template v-if="$slots.icon">
      <slot
        v-if="$slots.icon"
        name="icon"
      />
    </template>
  </a>
</template>

<script>
// 重写 el-link，增强能力
export default {
    name: 'ElLink',

    inject: {
    //   elForm: {
    //     default: ''
    //   },
        elFormItem: {
            default: '',
        },
    },

    props: {
        type: {
            type: String,
            default: 'default',
        },
        underline: {
            type: Boolean,
            default: false,
        },
        disabled: Boolean,
        href: String,
        icon: String,
        size: String,
        to: Object,
    },
    computed: {
        _elFormItemSize() {
            return (this.elFormItem || {}).elFormItemSize;
        },
        // 先复用 input
        linkSize() {
            return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
        },
        linkHref() {
            if (typeof window === 'undefined') return;
            if (this.to && this.$router && this.$router.resolve) {
                const routeData = this.$router.resolve(this.to); // 通过自带 api 解析
                if (routeData) { // 得到 href
                    const pathname = window.location.pathname || '';
                    const href = routeData.href;
                    if (href.startsWith('#')) { // 兼容 base 标签
                        return pathname + href;
                    }
                    return href;
                }
            }
            return this.href;
        },
    },
    methods: {
        handleClick(event) {
            if (!this.disabled) {
                if (!this.href) {
                    this.$emit('click', event);
                }
            }
        },
    },
};
</script>
