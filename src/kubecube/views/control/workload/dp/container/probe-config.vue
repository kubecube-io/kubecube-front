<template>
  <el-form-item
    :label="probeMapping[probe]"
  >
    <el-switch
      v-model="model.enable"
    />
    <template v-if="model.enable">
      <template v-if="['LivenessProbe', 'ReadyProbe'].includes(probe)">
        <el-form-item label="故障阈值" style="margin-bottom: 22px;">
          <el-input-number v-model="model.failureThreshold" controls-position="right" :min="1" style="width: 300px;"/>
          <span style="margin-left:8px">次</span>
        </el-form-item>
        <el-form-item label="健康阈值" style="margin-bottom: 22px;">
          <el-input-number v-model="model.successThreshold" controls-position="right" :min="1" style="width: 300px;" :disabled="probe === 'LivenessProbe'"/>
          <span style="margin-left:8px">次</span>
        </el-form-item>
        <el-form-item label="初始等待时间" style="margin-bottom: 22px;">
          <el-input-number v-model="model.initialDelaySeconds" controls-position="right" :min="0" style="width: 300px;"/>
          <span style="margin-left:8px">秒</span>
        </el-form-item>
        <el-form-item label="监测间隔时间" style="margin-bottom: 22px;">
          <el-input-number v-model="model.periodSeconds" controls-position="right" :min="1" style="width: 300px;"/>
          <span style="margin-left:8px">秒</span>
        </el-form-item>
        <el-form-item label="检测超时时间" style="margin-bottom: 22px;">
          <el-input-number v-model="model.timeoutSeconds" controls-position="right" :min="1" style="width: 300px;"/>
          <span style="margin-left:8px">秒</span>
        </el-form-item>
      </template>
      <el-form-item label="检测方式" style="margin-bottom: 22px;">
        <el-radio-group v-model="model.method">
          <el-radio-button v-for="item in types" :label="item.value" :key="item.value">{{item.text}}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="model.method === 'exec'"
        label="执行脚本"
        style="margin-bottom: 22px;"
        :prop="`${prefixKey}.command`"
        :rules="[
          { required: true, message: '执行脚本不能为空'},
        ]"
      >
        <qz-editor
          style="border: 1px solid #E1E8ED"
          height="160"
          width="580"
          v-model="model.command"
          theme="vs"
          language="shell"
          :options="{ minimap: {enabled: false} }"
        />
      </el-form-item>
      <template v-else>
        <el-form-item label="Host" style="margin-bottom: 22px;">
          <el-input
            v-model="model.host"
          />
        </el-form-item>
        <el-form-item
          v-if="model.method === 'httpGet'"
          label="Path"
          style="margin-bottom: 22px;"
          :prop="`${prefixKey}.path`"
          :rules="[
            { required: true, message: 'Path不能为空'},
            validators.startsWithSlash(true),
            validators.consistofPath(true)
          ]"
        >
          <el-input
            v-model="model.path"
          />
        </el-form-item>
        <el-form-item label="Port">
          <el-input-number
            v-model="model.port"
            :min="1"
            :max="65535"
            style="width: 300px;"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item 
          v-if="model.method === 'httpGet'"
          label="Header"
        > 
          <dynamicBlock
            v-model="model.httpHeaders"
            :getDefaultItem="getDataTemplate"
            :columns="[
                {
                    title: 'Name',
                    dataIndex: 'name',
                },
                {
                    title: 'Value',
                    dataIndex: 'value',
                },
            ]"
          >
            <template v-slot:name="{record}">
              <el-input v-model="record.name"/>
            </template>
            <template v-slot:value="{record}">
              <el-input v-model="record.value"/>
            </template>
          </dynamicBlock>
        </el-form-item>
      </template>
    </template>
  </el-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import * as validators from 'kubecube/utils/validators';
const probeMapping = {
    LivenessProbe: '存活探针',
    ReadyProbe: '就绪探针',
    LifePreStopProbe: '生命周期-停止前',
    LifePostStopProbe: '生命周期-启动后',
};
export default {
    mixins: [ makeVModelMixin ],
    props: {
        prefixKey: {
            type: String,
            default: '',
        },
        probe: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            validators,
            probeMapping,
            types: [
                { value: 'exec', text: '脚本' },
                { value: 'httpGet', text: 'HTTP' },
                { value: 'tcpSocket', text: 'TCP' },
            ],
        };
    },
    methods: {
        getDataTemplate() {
            return {
                name: '',
                value: '',
            };
        },
    },
};
</script>

<style>

</style>
