<template>
  <div>
    <template v-if="isInSubRoute">
      <router-view />
    </template>
    <template v-else>
      <u-linear-layout style="margin-bottom: 20px;">
        <u-button
          icon="create"
          color="primary"
          @click="createCRD"
        >
          创建自定义资源
        </u-button>
        <u-button
          icon="refresh"
          square
          @click="doRefresh"
        />
        <kube-input-search
          :align-right="true"
          placeholder="请输入名称搜索"
          @search="onSearch"
        />
      </u-linear-layout>
      <u-tabs router>
        <u-tab
          v-for="item in tabs"
          :key="item.title"
          :title="item.title"
          :to="item.route"
        />
      </u-tabs>
      <div>
        <router-view
          :refresh-key="refreshKey"
          :selector="selector"
        />
      </div>
    </template>
  </div>
</template>
<script>
import workloadService from 'kubecube/services/k8s-resource';
import { get } from 'vuex-pathify';
export default {
    metaInfo() {
        return {
            title: 'CRD - kubecube',
        };
    },
    data() {
        return {
            tabs: [
                { title: '集群级别', route: { path: '/control/crd/Cluster' } },
                { title: '空间级别', route: { path: '/control/crd/Namespaced' } },
            ],
            selector: '',
            refreshKey: +new Date(),
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        reqParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                },
            };
        },
        level() {
            return this.$route.params.level;
        },
        isInSubRoute() {
            return this.$route.name === 'crd.detail';
        },
    },
    methods: {
        doRefresh() {
            this.refreshKey = +new Date();
        },
        onSearch(content) {
            this.selector = content ? `metadata.name~${content}` : undefined;
        },
        createCRD() {
            this.$editResource({
                title: '创建自定义资源',
                content: {
                    apiVersion: 'apiextensions.k8s.io/v1beta1',
                    kind: 'CustomResourceDefinition',
                    metadata: {
                        name: '',
                    },
                    spec: {

                    },
                },
                onSubmit: async content => {
                    console.log(content);
                    await workloadService.createCRD({
                        ...this.reqParam,
                        data: content,
                    });
                    this.refresh();
                },
            });
        },
    },
};
</script>
