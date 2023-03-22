<template>
  <div>
    <el-form-item
      label="Ports"
      :prop="prefixProp"
      :rules="[
        ...(required ? [ validators.required() ] : []),
        validators.arrayRequired(required ? ( isNodePort ? ['name', 'targetPort', 'port'] : ['name', 'targetPort', 'port']) : ''),
      ]"
      :class="$style.wrapFromItem"
    >
      <dynamicBlock
        v-model="model"
        :getDefaultItem="getDataTemplate"
        :columns="[
            {
                title: 'TargetPort',
                dataIndex: 'targetPort',
            },
            {
                title: '协议',
                dataIndex: 'protocol',
            },
            {
                title: '服务端口',
                dataIndex: 'port',
            },
            ...(isNodePort ? [ { title: 'NodePort', dataIndex: 'nodePort' }] : []),
            {
                title: '名称',
                dataIndex: 'name'
            }
        ]"
      >
        <template slot="th-targetPort">
          目标端口
          <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
            <template slot="content">
              pod的端口
            </template>
            <i class="el-icon-question"/>
          </el-tooltip>
        </template>
        <template slot="th-port">
          服务端口
          <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
            <template slot="content">
              k8s集群内部访问service的端口
            </template>
            <i class="el-icon-question"/>
          </el-tooltip>
        </template>
        <template slot="th-nodePort">
          NodePort
          <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
            <template slot="content">
              NodePort 为通过节点转发的访问端口，为空时K8s默认会自动在【30000~32767】之间随机分配，可能会与其他应用产生冲突，强烈建议该端口由管理员统一分配使用。
            </template>
            <i class="el-icon-question"/>
          </el-tooltip>
        </template>
        <template v-slot:targetPort="{record: portModel, index: portIndex}">
          <el-form-item
            label=""
            :prop="`${prefixProp}.${portIndex}.targetPort`"
            :rules="[
              validators.consistofNumber(false),
              validators.numberBetween(1, 65535, false),
            ]"
          >
            <el-input v-model="portModel.targetPort" placeholder="1-65535内的整数"/>
          </el-form-item>
        </template>
        <template v-slot:protocol="{record: portModel}">
          <el-select
            v-model="portModel.protocol"
          >
            <el-option label="TCP" value="TCP"/>
            <el-option v-if="showUdp" label="UDP" value="UDP"/>
          </el-select>
        </template>
        <template v-slot:port="{record: portModel, index: portIndex}">
          <el-form-item
            label=""
            :prop="`${prefixProp}.${portIndex}.port`"
            :rules="[
              validators.consistofNumber(false),
              validators.numberBetween(1, 65535, false),
              validators.enhanceNoRedundance(exsitKeys, `${portModel.protocol}-${portModel.port}`, false),
            ]"
          >
            <el-input v-model="portModel.port" placeholder="1-65535内的整数"/>
          </el-form-item>
        </template>
        <template v-slot:nodePort="{record: portModel, index: portIndex}">
          <el-form-item 
            label=""
            :prop="`${prefixProp}.${portIndex}.nodePort`"
            :rules="[
              validators.consistofNumber(false),
              validators.numberBetween(30000, 32767, false),
            ]"
          >
            <el-input v-model="portModel.nodePort" placeholder="30000-32767，默认随机"/>
          </el-form-item>
        </template>
        <template v-slot:name="{record: portModel, index: portIndex}">
          <el-form-item
            label=""
            :prop="`${prefixProp}.${portIndex}.name`"
            :rules="[
              validators.consistoLetterNumbersUnderscores(false),
              validators.endsWithLowercaseLetterOrNumber(false),
              validators.noRedundance(exsitNames, false),
              validators.lengthBetween(1, 63, false),
            ]"
          >
            <el-input v-model="portModel.name" placeholder="1-63位小写字母、数字或中划线组成，字母和数字开头和结尾"/>
          </el-form-item>
        </template>
      </dynamicBlock>
      <el-alert
        v-if="isEdit"
        title="修改Ports名称会导致对应的对外服务端口失效，需要重新设置对应的对外服务端口"
        type="info"
        show-icon
        :closable="false"
        style="line-height: 22px;margin-top:4px"
      >
      </el-alert>
    </el-form-item>
  </div>
</template>
<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ makeVModelMixin ],
    inject: [ 'elForm' ],
    props: {
        name: {
            type: String,
            default: 'PortsInput',
        },
        isEdit: {
            type: Boolean,
            default: false,
        },
        isNodePort: Boolean,
        showUdp: {
            type: Boolean,
            default: true,
        },
        required: {
            type: Boolean,
            default: false,
        },
        prefixProp: {
          type: String,
          default: '',
        }
    },
    data() {
      return {
        validators
      }
    },
    computed: {
        exsitKeys() {
            return this.model.map(item => item.protocol + '-' + item.port);
        },
        exsitNames() {
            return this.model.map(item => item.name);
        },
    },
    watch: {
        // model: {
        //     handler(val) {
        //         this.$nextTick(() => {
        //           this.elForm.validateField(this.prefixProp);
        //         });
        //     },
        //     deep: true,
        // },
        required() {
            this.$nextTick(() => {
                this.elForm.validateField(this.prefixProp);
            });
        },
    },
    mounted() {
        this.$watch('model', {
            handler(val) {
                this.$nextTick(() => {
                    this.elForm.validateField(this.prefixProp);
                });
            },
            deep: true,
        });
    },
    methods: {
        getRandomString(length = 1) {
            let tmp = CHARS[ Math.floor(Math.random() * (CHARS.length - 10)) ];
            if (length < 1) {
                length = 1;
            }

            for (let i = 0; i < length - 1; i++) {
                const char = CHARS[Math.floor(Math.random() * CHARS.length)];
                tmp += char;
            }
            return tmp;
        },
        getDataTemplate() {
            return {
                targetPort: '',
                port: '',
                protocol: 'TCP',
                nodePort: '',
                name: this.getRandomString(6),
            };
        },
    },
};
</script>

<style module>
.wrapFromItem:global(.is-error .el-input__inner) {
  border-color: #e5e5e5;
}
.wrapFromItem:global(.is-error .el-input__inner:focus) {
  border-color: #467AFA;
}
</style>
