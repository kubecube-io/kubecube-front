<template>
  <u-modal
    title="添加节点"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="large"
    @close="close"
  >
    <div style="max-width: 580px;color: #999;padding-bottom: 5px;">
      根据文档完成新节点添加：
      <br>
      <u-link
        target="_blank"
        href="http://www.kubecube.io/docs/installation-guide/add-k8s-node/#向集群添加工作节点"
      >
        www.kubecube.io/docs/installation-guide/add-k8s-node/#向集群添加工作节点
      </u-link>
    </div>

    <!-- <u-linear-layout>
      <u-button
        v-clipboard:copy="wgetCode"
        v-clipboard:success="onCopy"
        color="primary"
      >
        <u-status-icon
          v-if="copied"
          name="success"
          color="primary"
        />
        <span v-if="copied">已复制</span>
        <span v-else>复制</span>
      </u-button>
      <u-button @click="show = false">
        取消
      </u-button>
    </u-linear-layout> -->
  </u-modal>
</template>

<script>
import { Modal } from '@micro-app/common/mixins';

export default {
    mixins: [ Modal ],
    props: {
        instance: Object,
    },
    data() {
        return {
            copied: false,
        };
    },
    //     computed: {
    //         wgetCode() {
    //             return `wget ${ncsDeployUrl}/skiff-k8s-deploy/add-node.py &&
    // python add-node.py -apiserver ${this.instance.kubeApiserver}`;
    //         },
    //     },
    methods: {
        onCopy() {
            this.copied = true;
            if (this.intervId) {
                clearInterval(this.intervId);
            }
            this.intervId = window.setInterval(
                () => {
                    this.copied = false;
                }, 3000);
        },
    },
};
</script>

<style>

</style>
