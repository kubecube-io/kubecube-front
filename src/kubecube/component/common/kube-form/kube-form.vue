<template>
  <div
    :class="$style.root"
    :layout="layout"
    @submit.prevent
  >
    <slot />
  </div>
</template>

<script>
export default {
    name: 'KubeForm',
    props: {
        layout: {
            type: String,
            default: 'block',
        },
    },
};
</script>

<style module>
.root {}

.root[layout="block"] > * {
    display: block;
}

.root[layout="block"] > *:not(:last-child) {
    margin-bottom: 20px;
}

.root[layout="inline"] > * {
    display: inline-block;
}

.root[layout="inline"] > *:not(:last-child) {
    margin-right: 20px;
}
.root[label-size$="small"] [kube-item="label"] > label{ width: 80px; padding-right: 10px; }
.root[label-size$="small"] [kube-item="label"] > label::after { right: 2px; }
.root[label-size$="small"] div[kube-item="field"] { max-width: calc(100% - 80px); }

.root[label-size$="large"] [kube-item="label"] > label{ width: 160px; padding-right: 20px; }
.root[label-size$="large"] [kube-item="label"] > label::after { right: 12px; }
.root[label-size$="large"] div[kube-item="field"] { max-width: calc(100% - 160px); }

.root[label-size$="normal"] [kube-item="label"] > label{ width: 120px; padding-right: 20px; }
.root[label-size$="normal"] [kube-item="label"] > label::after { right: 12px; }
.root[label-size$="normal"] div[kube-item="field"] { max-width: calc(100% - 120px); }


</style>
