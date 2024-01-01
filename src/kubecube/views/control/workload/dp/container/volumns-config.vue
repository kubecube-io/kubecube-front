<template>
  <div>
    <el-form-item label="挂载数据卷">
      <div v-if="tabs[activeIndex].tab === 'pvc'" style="color: #999;line-height:24px">
        <div style="display:flex;align-items:center">
          <span>
            根据存储提供者不同，选择PVC支持的访问模式不同，具体规则参照
          </span>
          <el-link type="primary" style="margin-left:4px" href="https://kubernetes.io/zh-cn/docs/concepts/storage/persistent-volumes/#access-modes" target="_blank">链接</el-link>
        </div>
        <div>
          注:Kubernetes不对挂载选项执行合法性检查。如果挂载选项是非法的，挂载就会失败。
        </div>
      </div>
      <dynamicTab
        :activeIndex.sync="activeIndex"
        :value="tabs"
        :showAddBtn="false"
        :showDeleteBtn="false"
      >
        <template v-slot:tabNav="{item}">
          {{item.title}}
          <span
            v-if="item.tab === 'pvc' && pvcLength"
            :class="$style.indicator"
          >
            {{ pvcLength }}
          </span>
          <span
            v-if="item.tab === 'configmap' && configmapLength"
            :class="$style.indicator"
          >
            {{ configmapLength }}
          </span>
          <span
            v-if="item.tab === 'secret' && secretLength"
            :class="$style.indicator"
          >
            {{ secretLength }}
          </span>
          <span
            v-if="item.tab === 'emptyDir' && emptyDirLength"
            :class="$style.indicator"
          >
            {{ emptyDirLength }}
          </span>
          <span
            v-if="item.tab === 'hostpath' && hostpathLength"
            :class="$style.indicator"
          >
            {{ hostpathLength }}
          </span>
          <span
            v-if="item.tab === 'vct' && vctLength"
            :class="$style.indicator"
          >
            {{ vctLength }}
          </span>
          <i v-if="hasError(item.tab, validateStatus)" :class="['el-icon-warning', $style.errorIcon]"/>
        </template>
        <template slot-scope="{item}">
          <pvc-config
            v-if="item.tab === 'pvc'"
            v-model="model.pvc"
            :volume="model"
            :prefixKey="`${errorPrefix}.${item.tab}`"
          />
          <configmap-config
            v-if="item.tab === 'configmap'"
            v-model="model.configmap"
            :prefixKey="`${errorPrefix}.${item.tab}`"
            :volume="model"
            :image="image"
          />
          <secret-config
            v-if="item.tab === 'secret'"
            v-model="model.secret"
            :prefixKey="`${errorPrefix}.${item.tab}`"
            :volume="model"
          />
          <empty-dir-config
            v-if="item.tab === 'emptyDir'"
            v-model="model.emptyDir"
            :prefixKey="`${errorPrefix}.${item.tab}`"
            :volume="model"
            :pod-volumes="podVolumes"
            :open-dialog="openDialog"
          />
          <host-path-config
            v-if="item.tab === 'hostpath'"
            v-model="model.hostpath"
            :prefixKey="`${errorPrefix}.${item.tab}`"
            :volume="model"
          />
          <vct-config
            v-if="item.tab === 'vct'"
            v-model="model.vct"
            :prefixKey="`${errorPrefix}.${item.tab}`"
            :storage="storage"
            :volume="model"
          />
        </template>
      </dynamicTab>
    </el-form-item>
  </div>
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
    inject: [ 'elForm' ],
    props: {
        storage: Array,
        errorPrefix: String,
        podVolumes: Object,
        openDialog: Function,
        image: String,
    },
    data() {
        return {
            validateStatus: {},
            activeIndex: 0,
        };
    },
    watch: {
        model: {
            handler() {
                this.validateStatus = {};
            },
        },
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
    mounted() {
        this.elForm && this.elForm.$on('validate', this.validateListener);
    },
    destroyed() {
        this.elForm && this.elForm.$off('validate', this.validateListener);
    },
    methods: {
        validateListener(prop, valid, message) {
            if (this.errorPrefix && prop.startsWith(`${this.errorPrefix}.`)) {
                const key = prop.slice(`${this.errorPrefix}`.length).split('.')[1];
                if (this.validateStatus[key]) {
                    this.validateStatus[key][prop] = { valid, message };
                } else {
                    this.validateStatus[key] = {};
                    this.validateStatus[key][prop] = { valid, message };
                }
                this.validateStatus = { ...this.validateStatus };
            }
        },
        hasError(index, validateStatus) {
            const status = validateStatus[index];
            const keys = status ? Object.keys(status) : [];
            return keys.some(key => status[key] && !status[key].valid);
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
.errorIcon{
  font-size: 14px;
  color: #f54545;
  cursor: pointer;
  position: absolute;
  top: 12px;
  left: 4px;
}
</style>
