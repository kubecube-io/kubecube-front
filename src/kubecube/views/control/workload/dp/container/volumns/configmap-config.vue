<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
          {
              title: 'ConfigMap名称',
              dataIndex: 'resource'
          },
          {
              title: 'items',
              dataIndex: 'key'
          },
          {
              title: '挂载目录',
              dataIndex: 'mountPath'
          },
          {
              title: '子路径',
              dataIndex: 'subPath'
          },
          {
              title: '文件路径',
              dataIndex: 'filePath'
          },
      ]"
    >
      <template slot="th-key">
        items
        <el-tooltip effect="dark" content="通过 Items 将 ConfigMap 中的某个键值的内容挂载在数据卷中某个文件路径下。" placement="right" popper-class="ncs-el-tooltip-popper">
          <i class="el-icon-question"/>
        </el-tooltip>
      </template>
      <template slot="th-mountPath">
        挂载目录
        <el-tooltip effect="dark" content="即 MountPath，将数据挂载到指定的路径。如果未指定 subpath，则会将目录下所有的文件/目录覆盖。" placement="right" popper-class="ncs-el-tooltip-popper">
          <i class="el-icon-question"/>
        </el-tooltip>
      </template>
      <template slot="th-subPath">
        子路径
        <el-tooltip effect="dark" content="即 subpath，会作为文件/目录放入挂载路径中,不会覆盖挂载路径中的其它文件/目录。" placement="right" popper-class="ncs-el-tooltip-popper">
          <i class="el-icon-question"/>
        </el-tooltip>
      </template>
      <template slot="th-filePath">
        文件路径
        <el-tooltip effect="dark" content="即 Path，用于重命名挂载的文件。" placement="right" popper-class="ncs-el-tooltip-popper">
          <i class="el-icon-question"/>
        </el-tooltip>
      </template>
      <template v-slot:imageFilter="{record}">
        <div style="text-align:center">
          <el-checkbox v-model="record.imageFilter" />
        </div>
      </template>
      <template v-slot:resource="{record}">
        <el-select v-model="record.resource" placeholder="请选择" filterable size="huge" @change="record.key = ''">
            <el-option
              v-for="item in resources"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
      </template>
      <template v-slot:key="{record}">
        <el-select v-model="record.key" placeholder="请选择" filterable>
          <el-option
            v-for="item in getConfigMapKeyList(record.resource)"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
      <template v-slot:mountPath="{record, index}">
        <el-form-item 
          label=""
          :prop="`${prefixKey}.${index}.mountPath`"
          :rules="[
            validators.startsWithSlash(false),
            validators.consistofPath(false),
            validators.noRedundance(allMountPath, false)
          ]"
        >
          <el-input
            v-model="record.mountPath"
            :disabled="!record.resource"
          />
        </el-form-item>
      </template>
      <template v-slot:subPath="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixKey}.${index}.subPath`"
          :rules="[
            validators.consistofSubPath(false)
          ]"
        >
          <!-- <el-input
            v-model="record.subPath"
            :disabled="!record.resource"
          /> -->
          <el-select v-model="record.subPath" placeholder="请选择" filterable :disabled="!record.resource" allow-create>
            <el-option
              v-for="item in getConfigMapKeyList(record.resource)"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </template>
      <template v-slot:filePath="{record, index}">
        <el-form-item
          v-if="record.key"
          label=""
          :prop="`${prefixKey}.${index}.filePath`"
          :rules="[
            validators.consistofSubPath(false)
          ]"
        >
          <el-input
            v-model="record.filePath"
            :disabled="!record.resource"
          />
        </el-form-item>
        <div v-else></div>
      </template>
    </dynamicBlock>
    <div>
      如需新的ConfigMap，可
      <el-link
        type="primary"
        @click="openNewWindow({ path: '/control/configmaps/list', query: $route.query })"
      >
        创建ConfigMap
      </el-link>
      <i
        style="font-size:16px; margin-left: 8px"
        :class="loading ? 'el-icon-loading' : 'el-icon-refresh-right'"
        @click="update"
      />
    </div>
  </div>
  <!-- </template>
  </x-request> -->
</template>

<script>
import { flatten } from 'lodash';
import { makeVModelMixin } from 'kubecube/mixins/functional';
import volumnMixin from './volumn-mixin';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    props: {
        image: String,
    },
    data: () => ({
        validators,
        resource: 'configmaps',
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-volume-configmaps-`;
        },
        allOtherMountPath() {
            const otherVolumns = [];
            for (const key in this.volume) {
                if (key !== 'configmap') {
                    otherVolumns.push(this.volume[key]);
                }
            }
            const paths = flatten(otherVolumns.map(v => flatten(v.map(t => t.mountPath)))).filter(p => p);
            return paths;
        },
    },
    methods: {
        getConfigMapKeyList(resource) {
            const configmap = this.resources && this.resources.find(r => r.value === resource);
            if (configmap) {
                return [
                    { text: '暂不选择', value: '' },
                    ...Object.keys(configmap.data || {}).map(d => ({ text: d, value: d })),
                ];
            }
            return [];
        },
        getDataTemplate() {
            return {
                imageFilter: false,
                resource: '',
                mountPath: '',
                subPath: '',
                key: '',
                filePath: '',
            };
        },
    },
};
</script>

<style>

</style>
