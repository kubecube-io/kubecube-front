<template>
  <div>
    <u-notice
      icon="warning"
      color="info"
    >
      平台管理员可以通过 kubectl 客户端管理容器集群资源
      <div>可管理的资源为Deployment、StatefulSet、Pod、RS、Service、Ingress、Endpoint、 Configmap、Secret、PVC、HPA、PV</div>
    </u-notice>

    <section :class="$style.section">
      <div :class="$style.title">
        1. 确认本地已安装 kubectl 客户端（适配 1.9 及以上版本）
      </div>
    </section>
    <section :class="$style.section">
      <div :class="$style.title">
        2. 下载所需的配置文件
      </div>
      <div :class="$style.content">
        <u-button
          color="primary"
          @click="download"
        >
          下载配置文件
        </u-button>
      </div>
    </section>
    <section :class="$style.section">
      <div :class="$style.title">
        3. 将配置文件 config 放置到 .kube 目录下，执行 kubectl config view 查看配置是否生效
      </div>
      <div :class="$style.content">
        如果配置文件名称修改为其他名称，则在使用 kubectl 时，通过--kubeconfig=&lt;fullname&gt;指定所用的配置文件
      </div>
    </section>

    <!-- <u-section title="2. 下载所需的配置文件" />
    <u-section title="3. 将配置文件 config 放置到 .kube 目录下，执行 kubectl config view 查看配置是否生效">
      <div :class="$style.wrap">
        如果配置文件名称修改为其他名称，则在使用 kubectl 时，通过--kubeconfig=&lt;fullname&gt;指定所用的配置文件
      </div>
    </u-section> -->
    <!-- <u-section title="4. 使用 Kubectl 创建和管理资源"> -->
    <!-- <div :class="$style.wrap">
        轻舟容器云通过在资源上添加附加信息对资源进行逻辑隔离，比如区分租户、项目。通过web端创建资源，容器云已为您自动添加了相应的信息，但是通过 kubectl 客户端创建时，我们无法自动添加这些信息。因此需要在使用时手工添加 labels 信息。
        <p>具体信息如下：</p>
        <div>system/tenant=&lt;租户标识></div>
        <div>system/&lt;项目标识>=true</div>
        <div>system/namespace=&lt;空间名称></div>
      </div>
      <p>可用设置</p>
      <u-linear-layout direction="vertical">
        <u-linear-layout>
                    <span>租户</span>
                    <u-select v-if="tenants.length" v-model="tenantId" :data="tenants"></u-select>
                    <u-select v-else disabled :data="emptyTenant"></u-select>
                    <span>项目</span>
                    <u-select v-if="projects.length" v-model="projectId" :data="projects"></u-select>
                    <u-select v-else disabled :data="emptyProject"></u-select>
                </u-linear-layout>
                <u-table-view :data="list" :loading="!nsLoaded" layout="fixed">
                    <u-table-view-column title="租户标识" width="30%" ellipsis>{{ tenantName }}</u-table-view-column>
                    <u-table-view-column title="项目标识" width="30%" ellipsis>{{ projectName }}</u-table-view-column>
                    <u-table-view-column title="空间名称" label="name" width="40%" ellipsis></u-table-view-column>
                </u-table-view>
      </u-linear-layout> -->
    <!-- </u-section> -->
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import userService from 'kubecube/services/user';
import { decode } from 'js-base64';
export default {
    metaInfo() {
        return {
            title: '常用工具 - kubecube',
        };
    },
    data() {
        return {
            clusterIds: [],
        };
    },
    computed: {
        user: get('scope/user@AccountId'),
    },
    methods: {
        async download() {
            // console.log(this.user)
            const response = await userService.getKubeconfigs({
                params: {
                    user: this.user,
                },
            });
            const p = decode(response);
            const filename = 'config.yaml';
            const url = 'data:application/x-yaml;charset=utf-8,' + encodeURIComponent(p);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove(); // afterwards we remove the element again

        },
    },
};
</script>

<style module>
.wrap {
    background: #f5f7f9;
    padding: 20px;
    word-break: break-all;
}
.wrap > div {
    color: #999;
}
.section {
    margin: 20px 0;
}
.section .content {
        margin: 20px 0 20px 20px;
    max-width: 700px;
}
</style>
