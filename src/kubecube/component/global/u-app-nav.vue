<template>
  <aside :class="['g-side', $style.root]">
    <div class="g-sidebar">
      <u-sidebar collapsible>
        <u-sidebar-header
          label="控制台"
        />
        <div style="margin-bottom: 12px;">
          <div :class="$style.subTitle">
            集群
          </div>
          <div :class="$style.subTitle">
            <u-app-cluster-select />
          </div>
          <div :class="$style.subTitle">
            空间
          </div>
          <div :class="$style.subTitle">
            <u-app-namespace-select />
          </div>
        </div>
        <u-sidebar-divider />

        <u-sidebar-group
          expanded
          class="m-sidebar-group"
        >
          <span slot="title"><u-icons name="dashboard" />总览</span>
          <u-sidebar-item
            :to="{ path: '/control/dashboard' }"
          >
            资源监控
          </u-sidebar-item>
          <!-- <u-sidebar-item :to="{ path:`/panel/index` }">
            仪表盘
          </u-sidebar-item> -->
        </u-sidebar-group>
        <u-sidebar-divider />
        <div style="margin-left: 3px;">
          <div :class="$style.subTitleblock">
            应用中心
          </div>
        </div>
        <u-sidebar-group
          class="m-sidebar-group"
        >
          <span slot="title"><u-icons name="workload" />工作负载</span>
          <u-sidebar-item
            :to="{ path: '/control/deployments' }"
          >
            Deployments
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/statefulsets' }"
          >
            Statefulsets
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/daemonsets' }"
          >
            Daemonsets
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/cronjobs' }"
          >
            CronJob
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/jobs' }"
          >
            Job
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/pods' }"
          >
            Pods
          </u-sidebar-item>
        </u-sidebar-group>
        <u-sidebar-group class="m-sidebar-group">
          <span slot="title"><u-icons name="serverFinder" />服务与发现</span>
          <u-sidebar-item :to="{ path: '/control/services' }">
            Services
          </u-sidebar-item>
          <u-sidebar-item :to="{ path: '/control/ingresses' }">
            Ingresses
          </u-sidebar-item>
          <!-- <u-sidebar-item>
            LoadBalancer
          </u-sidebar-item> -->
        </u-sidebar-group>
        <u-sidebar-item :to="{ path: '/control/persistentvolumeclaims' }">
          <u-icons name="volume" />存储
        </u-sidebar-item>
        <u-sidebar-group class="m-sidebar-group">
          <span slot="title"><u-icons name="config" />配置</span>
          <u-sidebar-item
            :to="{ path: '/control/secrets' }"
          >
            Secret
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/configmaps' }"
          >
            ConfigMap
          </u-sidebar-item>
        </u-sidebar-group>
        <u-sidebar-item @click="() => $yamlDialog.open()">
          <u-icons name="yaml" />YAML 编排
        </u-sidebar-item>
        <u-sidebar-item :to="{ path: '/control/crd' }">
          <u-icons name="yaml" />自定义资源 CRD
        </u-sidebar-item>
        <u-sidebar-item @click="openCloudShell">
          <u-icons name="cloud-shell" />Cloud Shell
        </u-sidebar-item>
        <u-sidebar-item :to="{ path: '/control/bootstrap' }">
          <u-icons name="alarmRule" />常用工具
        </u-sidebar-item>

        <u-sidebar-divider />
        <div style="margin-left: 3px;">
          <div :class="$style.subTitleblock">
            运维中心
          </div>
        </div>
        <u-sidebar-group v-if="logseerFeatures" class="m-sidebar-group">
          <span slot="title"><u-icons name="config" />日志</span>
          <u-sidebar-item
            :to="{ path: '/control/logconfigs' }"
          >
            日志任务管理
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/lens/normal' }"
            @click="toLog"
          >
            日志查询
          </u-sidebar-item>
        </u-sidebar-group>

        <u-sidebar-group class="m-sidebar-group">
          <span slot="title"><u-icons name="config" />告警</span>
          <u-sidebar-item
            :to="{ path: '/control/PrometheusRule' }"
          >
            告警规则
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/AlertmanagerConfig' }"
          >
            告警策略组
          </u-sidebar-item>
          <!-- <u-sidebar-item
            :to="{ path: '/control/lens/alarmhistory' }"
          >
            告警历史
          </u-sidebar-item> -->
        </u-sidebar-group>
      </u-sidebar>
    </div>
    <!-- <yaml-dialog ref="yamlDialog" /> -->
  </aside>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import uAppClusterSelect from './header/u-app-cluster-select.vue';
import uAppNamespaceSelect from './header/u-app-namespace-select.vue';
export default {
    components: {
        uAppClusterSelect,
        uAppNamespaceSelect,
    },
    computed: {
        namespace: sync('scope/namespace'),
        cluster: sync('scope/cluster'),
        logseerFeatures: get('feature/features@logseer'),
        query: get('query'),
        // dashbo{ title: 'specialTerms.Dashboard', to: this.makeRoute("/dashboard"), icon: 'mdi-view-dashboard' },
        workloads() {
            return [

                // 有 cluster 的必须用makeRoute
                // { title: 'specialTerms.User', to: { path: "/user" }, icon: 'mdi-account-details' },
                { title: 'Deployments', to: this.makeRoute('/deployments') },
                { title: 'Statefullsets', to: this.makeRoute('/statefullsets') },
                { title: 'CronJob', to: this.makeRoute('/cronjob') },
            ];
        },
    },
    methods: {
        makeRoute(path) {
            return {
                path,
                query: this.query,
            };
        },
        openCloudShell() {
            this.$kubeterm();
        },
        toLog() {
            this.$store.dispatch('lens/setToDefault');
            this.$store.commit('like/RESET');
            this.$store.dispatch('timer/setTimer');
        },
    },

};
</script>

<style module>
.root{
    left: 0px;
    top: 64px;
    width: 180px;
    height: calc(100% - 64px);
}
.root > div {
    position: relative;
    width: 100%;
    height: 100%;
}
.subTitle {
    margin: 10px 0 0px 12px;
}
.subTitleblock{
    padding: 10px;
    font-size: 1.05em;
}
</style>
