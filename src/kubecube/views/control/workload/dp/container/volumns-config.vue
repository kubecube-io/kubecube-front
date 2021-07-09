<template>
  <kube-form-item
    layout="block"
    label="挂载数据卷"
    description="RWO类型存储声明，不支持多副本挂载，请设置副本数为1"
  >
    <kube-tab
      :list="tabs"
      title-key="title"
      tab-key="tab"
      :error-prefix="errorPrefix"
      disabled
    >
      <template #[`pvc.tab`]>
        <span
          v-if="pvcLength"
          :class="$style.indicator"
        >
          {{ pvcLength }}
        </span>
      </template>
      <template #pvc="{ errorPrefix: prefix }">
        <pvc-config
          v-model="model.pvc"
          :prefix-key="prefix"
          :volume="model"
        />
      </template>
      <template #[`configmap.tab`]>
        <span
          v-if="configmapLength"
          :class="$style.indicator"
        >
          {{ configmapLength }}
        </span>
      </template>
      <template #configmap="{ errorPrefix: prefix }">
        <configmap-config
          v-model="model.configmap"
          :prefix-key="prefix"
          :volume="model"
        />
      </template>
      <template #[`secret.tab`]>
        <span
          v-if="secretLength"
          :class="$style.indicator"
        >
          {{ secretLength }}
        </span>
      </template>
      <template #secret="{ errorPrefix: prefix }">
        <secret-config
          v-model="model.secret"
          :prefix-key="prefix"
          :volume="model"
        />
      </template>
      <template #[`emptyDir.tab`]>
        <span
          v-if="emptyDirLength"
          :class="$style.indicator"
        >
          {{ emptyDirLength }}
        </span>
      </template>
      <template #emptyDir="{ errorPrefix: prefix }">
        <empty-dir-config
          v-model="model.emptyDir"
          :prefix-key="prefix"
          :volume="model"
          :pod-volumes="podVolumes"
          :open-dialog="openDialog"
        />
      </template>
      <template #[`hostpath.tab`]>
        <span
          v-if="hostpathLength"
          :class="$style.indicator"
        >
          {{ hostpathLength }}
        </span>
      </template>
      <template #hostpath="{ errorPrefix: prefix }">
        <host-path-config
          v-model="model.hostpath"
          :prefix-key="prefix"
          :volume="model"
        />
      </template>
      <template #[`vct.tab`]>
        <span
          v-if="vctLength"
          :class="$style.indicator"
        >
          {{ vctLength }}
        </span>
      </template>
      <template #vct="{ errorPrefix: prefix }">
        <vct-config
          v-model="model.vct"
          :prefix-key="prefix"
          :storage="storage"
          :volume="model"
        />
        <!-- <host-path-config
          v-model="model.vct"
          :prefix-key="prefix"
          :volume="model"
          :storage="storage"
        /> -->
      </template>
    </kube-tab>
  </kube-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import pvcConfig from './volumns/pvc-config.vue';
import configmapConfig from './volumns/configmap-config.vue';
import secretConfig from './volumns/secret-config.vue';
import emptyDirConfig from './volumns/emptydir-config.vue';
import hostPathConfig from './volumns/hostpath-config.vue';
import vctConfig from './volumns/vct-config.vue';
const titleMap = {
    pvc: 'PVC',
    configmap: 'ConfigMap',
    secret: 'Secret',
    emptyDir: 'EmptyDir',
    hostpath: 'HostPath',
    vct: '存储模板',
};
export default {
    components: {
        pvcConfig,
        configmapConfig,
        secretConfig,
        emptyDirConfig,
        hostPathConfig,
        vctConfig,
    },
    mixins: [ makeVModelMixin ],
    props: {
        storage: Array,
        errorPrefix: String,
        podVolumes: Object,
        openDialog: Function,
    },
    computed: {
        tabs() {
            if (this.storage && this.storage.length > 0) {
                return [ 'vct', 'configmap', 'secret', 'emptyDir', 'hostpath' ].map(k => ({
                    tab: k,
                    title: titleMap[k],
                    // model: this.model[k],
                }));
            }
            return [ 'pvc', 'configmap', 'secret', 'emptyDir', 'hostpath' ].map(k => ({
                tab: k,
                title: titleMap[k],
                // model: this.model[k],
            }));
        },
        pvcLength() {
            return this.model.pvc.filter(p => p.mountPath && p.resource).length;
        },
        configmapLength() {
            return this.model.configmap.filter(p => p.mountPath && p.resource).length;
        },
        secretLength() {
            return this.model.secret.filter(p => p.mountPath && p.resource).length;
        },
        emptyDirLength() {
            return this.model.emptyDir.filter(p => p.mountPath && p.resource).length;
        },
        hostpathLength() {
            return this.model.hostpath.filter(p => p.mountPath && p.path).length;
        },
        vctLength() {
            return this.model.vct.filter(p => p.mountPath && p.name).length;
        },
    },
};
</script>

<style module>
.indicator{
    display: inline-block;
    position: absolute;
    width: 1.25em;
    height: 1.25em;
    line-height: 1.25em;
    background: #cad4e4;
    color: #fff;
    border-radius: 100%;
    right: 4px;
    text-align: center;
    top: 3px;
    font-size: .8em;
}
</style>
