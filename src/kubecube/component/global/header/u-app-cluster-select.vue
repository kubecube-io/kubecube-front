<template>
  <div>
    <el-select
      v-if="items.length"
      v-model="model"
      filterable
      placeholder="选择集群"
      :class="$style.suggestBox"
      :popper-class="$style.suggestPopper"
      @change="onBeforeSelect"
    >
      <el-option
        v-for="item in items"
        :key="item.value"
        :label="item.text"
        :value="item.value"
        :title="item.text"
      />
    </el-select>
    <el-input
      v-else
      value=""
      disabled
      placeholder="暂无集群"
      :class="$style.suggestBox"
    />
    <!-- <u-sidebar-suggest
      v-if="items.length"
      key="list"
      ref="cluster"
      :data="items"
      :value.sync="model"
      size="huge normal"
      placeholder="选择集群"
      @before-select="onBeforeSelect"
      @select="change"
    />
    <u-sidebar-suggest
      v-else
      key="none"
      disabled
      size="huge normal"
      placeholder="暂无集群"
    /> -->
  </div>
</template>

<script>
import { get } from 'lodash';
import { sync, get as getFromVuex } from 'vuex-pathify';
import clusterService from 'kubecube/services/cluster';
import valveMixin from 'kubecube/mixins/pipe/valve.mixin';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
export default {
    extends: valveMixin,
    data: () => ({
        items: [],
        name: 'cluster',
    }),
    computed: {
        cluster: sync('scope/cluster'),
        clusterList: sync('scope/clusterList'),
        routeCluster() {
            return this.$route.query.cluster;
        },
        tenant: getFromVuex('scope/tenant'),
        project: getFromVuex('scope/project'),
    },
    watch: {
        cluster(val) {
            if (this.model !== get(val, 'value')) {
                this.model = get(val, 'value');
            }
        },
    },
    methods: {
        onBeforeSelect(val) {
            // if (!this.isInNSBoard) {
            //     this.$router.push({ path: '/namespace' });
            // }
            this.cluster = this.items.find(i => i.value === val.value);
            this.model = val.value;
            const pathArr = this.$route.path.split('/');
            if (pathArr.length > 4 || this.$route.path.endsWith('create')) {
                this.$router.push({
                    path: pathArr.slice(0, 3).join('/'),
                });
            }
        },
        async request() {
            try {
                this.clusterLoading = true;
                if (!this.tenant) return;
                const namespace = get(this.project || this.tenant, 'spec.namespace');
                const r1 = await clusterService.getClusterByScope({
                    params: {
                        namespace,
                        pageSize: 10000,
                    },
                });
                const clusters = get(r1, 'items', []);
                const response = await clusterService.getClusters({
                    params: {
                        // status: 'normal',
                    },
                });
                const items = (response.items || []).filter(i => clusters.includes(i.clusterName));
                this.items = items.map(i => ({
                    text: i.annotations && i.annotations['cluster.kubecube.io/cn-name'] || i.clusterName,
                    value: i.clusterName,
                    ...i,
                    disabled: i.status !== 'normal', // 异常的禁用
                }));
                this.clusterList = this.items.slice();
                setValueIfListNotPresent({
                    list: this.items.filter(i => !i.disabled),
                    path: 'value',
                    current: this.model || this.routeCluster,
                }, val => {
                    // console.log(val);
                    this.model = val.value;
                    this.cluster = val;
                });
                this.clusterLoading = false;
                //  else {
                //     this.cluster = this.routeCluster;
                // }
            } catch (err) {
                this.$router.push({
                    path: '/namespace',
                });
            }
        },
        change() {

        },
        // doPagenation() {
        //     const query = this.$route.query;
        //     console.log(this.cluster);
        //     if(query.cluster !== this.cluster) {
        //         this.$router.replace({
        //             query: {
        //                 ...query,
        //                 cluster: this.cluster,
        //             }
        //         });
        //     }
        // },
    },
};
</script>

<style module>
    .suggestBox {
        width: 158px;
    }
    .suggestPopper {
        z-index: 500 !important;
    }
</style>
<i18n locale="en">
{
  "Cluster": "Cluster",
  "Namespace": "Namespace"
}
</i18n>

<i18n locale="zhHans">
{
  "Cluster": "集群",
  "Namespace": "空间"
}
</i18n>
