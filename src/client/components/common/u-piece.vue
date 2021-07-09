<template>
    <div :class="$style.root" :noBorder="noBorder" :size="size">
        <div v-if="title" :class="$style.title" :noBorder="noBorder">
{{ title }}
</div>
        <slot>
            <div :class="$style.value">
{{ value }}
</div>
        </slot>
        <div :class="$style.bottom">
            <slot name="bottom"></slot>
        </div>
    </div>
</template>

<style module>
.root {
    position: relative;
    border: 1px solid #ebf0f5;
    padding: 15px 18px;
}
.root[noBorder] {
    background: #f7f8fd;
    border: none;
}
.root:hover { box-shadow: 0 0 7px 0 rgba(0,0,0,.06); }
.root[noBorder]:hover { box-shadow: none; background: #f2f3f8; }

.title {
    margin-bottom: 10px;
}
.title[noBorder] { color: #8a8e9e; }
.value {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
}
.bottom {
    position: absolute;
    bottom: 20px;
    left: 20px;
}

.root[size$="auto"] { width: auto; }
.root[size^="auto"] { height: auto; }

.root[size$="full"] { width: 100%; }
.root[size^="full"] { height: 100%; }

.root[size$="mini"] { width: 16px; }
.root[size^="mini"] { height: 16px; }

.root[size$="small"] { width: 32px; }
.root[size^="small"] { height: 32px; }

/* .root[size$="normal"] { width: 300px; } */
.root[size^="normal"] { height: 92px; }

.root[size$="large"] { width: 400px; }
.root[size^="large"] { height: calc(92px * 2 + 20px); }
</style>

<script>

export default {
    name: 'u-piece',
    props: {
        size: { type: String, default: 'auto' },
        title: String,
        value: [String, Number],
        noBorder: { type: Boolean, default: false },
    },
    computed: {

    },

};
</script>
