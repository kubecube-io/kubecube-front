<template>
  <div :class="$style.root">
    <aside :class="['g-side', $style.nav]">
      <div class="g-sidebar">
        <u-sidebar collapsible>
          <u-sidebar-header
            label="用户"
          />
          <u-sidebar-item :to="{ path: '/metauser/openapi' }">
            秘钥管理
          </u-sidebar-item>
        </u-sidebar>
      </div>
    </aside>
    <div :class="$style.container">
      <div :class="$style.content">
        <u-app-bread-crumbs relative="metauser" />
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import uAppBreadCrumbs from 'kubecube/component/global/u-app-bread-cumbs.vue';
export default {
    components: {
        uAppBreadCrumbs,
    }
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
    min-width: 960px;
    max-width: 1160;
}
.full{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav{
    left: 0px;
    top: 64px;
    width: 180px;
    height: 100%;
}
.nav > div {
    position: relative;
    width: 100%;
    height: 100%;
}
.subTitle {
    margin: 10px 0 -5px 20px;
}
</style>
