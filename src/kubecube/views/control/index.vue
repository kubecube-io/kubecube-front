<template>
  <div :class="$style.root">
    <uAppSideBar />
    <div
      :class="$style.container"
      sticky-container
      infinite-scroll-container
      stream-scroll-container
    >
      <div
        v-if="globalLoading"
        :class="$style.full"
      >
        <u-loading
          size="huge"
        />
      </div>
      <div
        v-else
        :class="$style.content"
      >
        <u-app-bread-crumbs
          relative="control"
          :prefix="dashboardCrumb"
        />
        <router-view />
      </div>
    </div>
    <kube-term ref="kubeterm" />
  </div>
</template>

<script>
import Vue from 'vue';
import { get } from 'vuex-pathify';
import uAppBreadCrumbs from 'kubecube/component/global/u-app-bread-cumbs.vue';
import uAppSideBar from 'kubecube/component/global/u-app-nav.vue';
import kubeTerm from 'kubecube/component/global/xterm/kube-terminal.vue';
export default {
    components: {
        uAppBreadCrumbs,
        uAppSideBar,
        kubeTerm,
    },
    computed: {
        globalLoading: get('scope/loading'),
        dashboardCrumb() {
            return {
                to: {
                    path: '/namespace',
                },
                text: '我的空间',
            };
        },
    },
    watch: {
        globalLoading(val) {
            console.log(val);
        },
    },
    mounted() {
        Vue.prototype.$kubeterm = this.$refs.kubeterm.open;
    },
};
</script>

<style module>
.root{
    height: 100%;
}
.container{
    position: absolute;
    top: 64px;
    left: 180px;
    right: 0;
    bottom: 0;
    overflow: auto;
    background-color: #fff;
}
.content{
    padding: 40px;
    min-width: 1120px;
}
.full{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
