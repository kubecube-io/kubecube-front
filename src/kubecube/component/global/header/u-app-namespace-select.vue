<template>
  <div>
    <u-sidebar-suggest
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
    />
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
export default {
    extends: valveMixin,
    data: () => ({
        items: [],
        name: 'namespace',
    }),
    computed: {
        namespace: sync('scope/namespace'),
        cluster: get('scope/cluster'),
        tenant: get('scope/tenant'),
        project: get('scope/project'),
        pageIdentifier: get('scope/pageIdentifier'),
        routeNamespace() {
            return this.$route.query.namespace;
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
                const params = {
                    labelSelector: [],
                    pageSize: 10000,
                };
                if (this.tenant) {
                    params.labelSelector.push(`kubecube-tenant-${this.tenant.value}.tree.hnc.x-k8s.io/depth=2`);
                }
                if (this.project) {
                    params.labelSelector.push(`kubecube-project-${this.project.value}.tree.hnc.x-k8s.io/depth=1`);
                }
                params.labelSelector = params.labelSelector.join(',');
                const response = await nsService.getNamespaces({
                    pathParams: {
                        cluster: this.cluster.value,
                    },
                    params,
                });
                this.items = (response.items || []).map(i => {
                    const name = getFunc(i, 'metadata.name');
                    return {
                        text: name,
                        value: name,
                        ...i,
                    };
                });

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
        beforeChange({ value }) {
            if (value === this.namespace.value) return;
            this.namespace = this.items.find(i => i.value === value);
            const pathArr = this.$route.path.split('/');
            if (pathArr.length > 4 || this.$route.path.endsWith('create')) {
                this.$router.push({
                    path: pathArr.slice(0, 3).join('/'),
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

<style>

</style>
