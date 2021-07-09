<template>
  <validation-provider
    ref="provider"
    :name="name"
    :detect-input="false"
    :rules="{
      arrayRequired: {
        filterkey: required ? ( isNodePort ? ['name', 'targetPort', 'port', 'nodePort'] : ['name', 'targetPort', 'port']) : ''
      },
    }"
  >
    <kube-form-item
      label="Ports"
      layout="block"
      :required="required"
    >
      <kube-dynamic-block
        v-model="model"
        style="width: 580px"
        :data-template="getDataTemplate"
      >
        <template slot="column">
          <th>目标端口</th>
          <th>协议</th>
          <th>服务端口</th>
          <th v-if="isNodePort">
            NodePort
            <u-note>NodePort 方式下，可以直接指定暴露的 NodePort 端口，也可以让系统随机分配一个端口，端口将会在【30000~32767】之间，可以到Service详情中查看分配的端口</u-note>
          </th>
          <th>名称</th>
        </template>
        <template slot-scope="{ model, index }">
          <td>
            <validation-provider
              v-slot="{ errors }"
              :name="`TargetPort-${index}`"
              :rules="{
                ConsistofNumber: true,
                NumberBetween: { min: 1, max: 65535 },
              }"
            >
              <kube-form-item
                muted="no"
                style="width: 100%;"
                field-size="full"
                layout="none"
                :message="errors && errors[0]"
                placement="bottom"
              >
                <u-input
                  v-model="model.targetPort"
                  size="normal huge"
                  :color="errors && errors[0] ? 'error' : ''"
                  placeholder="1-65535内的整数"
                />
              </kube-form-item>
            </validation-provider>
          </td>

          <td>
            <u-select
              v-model="model.protocol"
              size="huge normal"
            >
              <u-select-item value="TCP">
                TCP
              </u-select-item>
              <u-select-item
                v-if="showUdp"
                value="UDP"
              >
                UDP
              </u-select-item>
            </u-select>
          </td>

          <td>
            <validation-provider
              v-slot="{ errors }"
              :name="`Port-${index}`"
              :rules="{
                ConsistofNumber: true,
                NumberBetween: { min: 1, max: 65535 },
                noRedundance: { list: exsitKeys }
              }"
            >
              <kube-form-item
                muted="no"
                style="width: 100%;"
                field-size="full"
                layout="none"
                :message="errors && errors[0]"
                placement="bottom"
              >
                <u-input
                  v-model="model.port"
                  size="normal huge"
                  :color="errors && errors[0] ? 'error' : ''"
                  placeholder="1-65535内的整数"
                />
              </kube-form-item>
            </validation-provider>
          </td>

          <td v-if="isNodePort">
            <validation-provider
              v-slot="{ errors }"
              :name="`nodePort-${index}`"
              :rules="{
                ConsistofNumber: true,
                NumberBetween: { min: 30000, max: 32767 },
              }"
            >
              <kube-form-item
                muted="no"
                style="width: 100%;"
                field-size="full"
                layout="none"
                :message="errors && errors[0]"
                placement="bottom"
              >
                <u-input
                  v-model="model.nodePort"
                  size="normal huge"
                  :color="errors && errors[0] ? 'error' : ''"
                  placeholder="30000-32767，默认随机"
                />
              </kube-form-item>
            </validation-provider>
          </td>

          <td>
            <validation-provider
              v-slot="{ errors }"
              :name="`Name-${index}`"
              :rules="{
                startsWithLowercaseLetter: true,
                ConsistoLetterNumbersUnderscores: true,
                endsWithLowercaseLetterOrNumber: true,
                noRedundance: { list: exsitNames }
              }"
            >
              <kube-form-item
                muted="no"
                style="width: 100%;"
                field-size="full"
                layout="none"
                :message="errors && errors[0]"
                placement="bottom"
              >
                <u-input
                  v-model="model.name"
                  size="normal huge"
                  :color="errors && errors[0] ? 'error' : ''"
                  maxlength="63"
                  placeholder="1-63位小写字母、数字或中划线组成，字母和数字开头和结尾"
                />
              </kube-form-item>
            </validation-provider>
          </td>
        </template>
      </kube-dynamic-block>
    </kube-form-item>
  </validation-provider>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
export default {
    mixins: [ makeVModelMixin ],
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
        model: {
            handler(val) {
                this.$refs.provider.validate(val);
            },
            deep: true,
        },
    },
    methods: {
        getRandomString(length = 1) {
            let tmp = '';
            if (length < 1) {
                length = 1;
            }

            for (let i = 0; i < length; i++) {
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

<style>

</style>
