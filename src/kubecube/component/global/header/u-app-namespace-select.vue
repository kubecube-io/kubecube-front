<template>
  <div>
    <el-select
      v-if="items.length"
      key="list"
      v-model="model"
      filterable
      placeholder="选择空间"
      :class="$style.suggestBox"
      :popper-class="$style.suggestPopper"
      @change="beforeChange"
    >
      <el-option
        v-for="item in items"
        :key="item.value"
        :label="item.text"
        :value="item.value"
        :title="item.text"
      />
    </el-select>
    <el-select
      v-else
      value=""
      disabled
      placeholder="暂无空间"
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
      @before-select="beforeChange"
      @select="change"
    />
    <u-sidebar-suggest
      v-else
      key="none"
      disabled
      size="huge normal"
      placeholder="暂无空间"
    /> -->
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get, sync } from 'vuex-pathify';
import nsService from 'kubecube/services/namespace';
import valveMixin from 'kubecube/mixins/pipe/valve.mixin';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
export async function loadNS({
    tenant,
    project,
    cluster,
}) {
    const params = {
        labelSelector: [],
        pageSize: 10000,
    };
    if (tenant) {
        params.labelSelector.push(`kubecube-tenant-${tenant.value}.tree.hnc.x-k8s.io/depth=2`);
    }
    if (project) {
        params.labelSelector.push(`kubecube-project-${project.value}.tree.hnc.x-k8s.io/depth=1`);
    }
    params.labelSelector = params.labelSelector.join(',');
    const response = await nsService.getNamespaces({
        pathParams: {
            cluster,
        },
        params,
    });
    return response;
}
export default {
    extends: valveMixin,
    data: () => ({
        items: [],
        name: 'namespace',
    }),
    computed: {
        namespace: sync('scope/namespace'),
        namespaceList: sync('scope/namespaceList'),
        cluster: get('scope/cluster'),
        tenant: get('scope/tenant'),
        project: get('scope/project'),
        pageIdentifier: get('scope/pageIdentifier'),
        routeNamespace() {
            return this.$route.query.namespace;
        },
    },
    watch: {
        namespace(val) {
            if (this.model !== getFunc(val, 'value')) {
                this.model = getFunc(val, 'value');
            }
        },
    },
    methods: {
        checkRoute() {

        },
        change() {

        },
        async request() {
            try {
                if (!this.cluster || !this.tenant) {
                    this.namespace = null;
                    // debugger
                    // this.$router.replace(this.$route.path);
                    return;
                }
                // const namespace = get(this.project || this.tenant, 'spec.name');
                this.namespaceLoading = true;
                const response = await loadNS({
                    tenant: this.tenant,
                    project: this.project,
                    cluster: this.cluster.clusterName,
                });
                this.items = (response.items || []).map(i => {
                    const name = getFunc(i, 'metadata.name');
                    return {
                        text: name,
                        value: name,
                        ...i,
                    };
                });

                this.namespaceList = this.items;

                setValueIfListNotPresent({
                    list: this.items,
                    path: 'metadata.name',
                    current: this.model || this.routeNamespace,
                }, val => {
                    console.log(val);
                    this.model = getFunc(val, 'metadata.name');
                    this.namespace = val;
                });
                this.namespaceLoading = false;
            } catch (err) {
                console.log(err);
                this.items = [];
                this.namespace = null;
            }
        },
        moveOnSamePath() {
            // debugger
            this.$router.push({
                query: {
                    cluster: this.cluster.value,
                    namespace: this.namespace.value,
                },
            });
        },
        beforeChange(value) {
            if (value === this.namespace.value) return;
            this.namespace = this.items.find(i => i.value === value);
            const pathArr = this.$route.path.split('/');
            if (pathArr.length > 4 || this.$route.path.endsWith('create')) {
                const p = this.$router.resolve(pathArr.slice(0, 3).join('/'));
                this.$router.push({
                    path: p.route.path,
                });
            }
            // console.log(this.namespace);
            // if (!this.isSubRoot && this.$route.meta.confirmRequired) {
            //     const path = getFunc(this.$router.resolve(this.$route), 'resolved.matched[1].path');
            //     this.$confirm({
            //         title: this.$t('tips.leaveConfirm.title'),
            //         content: this.$t('tips.leaveConfirm.content'),
            //     }).then(result => {
            //         if (result) {
            //             this.namespace = value;
            //             this.$router.push({
            //                 path,
            //                 query: {
            //                     cluster: this.cluster,
            //                     namespace: this.namespace,
            //                 },
            //             }).catch(() => {
            //                 console.log('redirect ignore');
            //             });
            //         } else {
            //             this.$refs.select.internalValue = this.namespace;
            //         }
            //     });
            // } else {
            //     this.namespace = value;
            // }


        },
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
