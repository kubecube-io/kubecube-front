<template>
  <div
    :class="$style.root"
    :layout="layout"
    :label-size="labelSize"
    kube-item="label"
  >
    <label
      v-show="showLabel"
      :class="$style.label"
      :required="required"
    >{{ label }}<slot name="label" /></label>
    <div
      :class="$style.field"
      kube-item="field"
    >
      <div
        v-if="showDisp"
        :class="$style.description"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </div>
      <slot />
      <span
        v-if="message"
        :class="$style.message"
        color="error"
      >
        {{ message }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
    name: 'KubeFormItem',
    props: {
        label: String,
        message: String,
        required: Boolean,
        labelSize: {
            type: String,
            default: 'normal',
        },
        layout: {
            type: String,
            default: '',
        },
        hideText: {
            type: Boolean,
            default: false,
        },
        description: String,
        showDiscription: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        showLabel() {
            return this.label || !this.hideText;
        },
        showDisp() {
            return this.description || this.showDiscription;
        },
    },
};
</script>

<style module>
@import 'proto-ui.vusion/src/u-form-item.vue/module.css';

.root {
    position: relative;
}

.label {
    color: #999;
    text-align: right;
    padding-right: 10px;
    position: relative;
}

.label[required]::after {
    content: '*';
    color: red;
    position: absolute;
    height: 12px;
    line-height: 12px;
    top: 7px;
}

.message {
    position: absolute;
    left: 100%;
    top: 0;
    display: none;
    margin-left: 10px;
    padding: 0 10px;
    line-height: 26px;
    font-size: 12px;
}

.message[color="focus"] {
    display: block;
    padding: 3px 10px;
    height: auto;
    width: 300px;
    background: #f7faff;
    color: #7dacde;
    border: 1px solid #d6e6fe;
}

.message[color="focus"]::after, .message[color="focus"]::before {
    position: absolute;
    content: '';
    top: 10px;
    left: -8px;
    border: 4px solid transparent;
    border-right: 4px solid #f7faff;
}

.message[color="focus"]::before {
    border-right-color: #d6e6fe;
    left: -9px;
}

.message[color="error"] {
    display: block;
    top: 50%;
    transform: translateY(-50%);
    white-space: nowrap;
    background-color: #ff867f;
    color: white;
}

.message[color="error"]::before {
    icon-font: url('cloud-ui.vusion/src/u-status-icon.vue/icons/warning.svg');
    color: white;
    font-size: 14px;
    margin-left: -2px;
    margin-right: 6px;
    vertical-align: -3px;
}

.message[color="error"]::after {
    content: '';
    position: absolute;
    right: 100%;
    top: 8px;
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-right: 4px solid #ff867f;
    border-bottom: 4px solid transparent;
}

.root[placement="bottom"] .message {
    transform: translateY(0);
}

.root[placement="bottom"] .message::after {
    display: none;
}

.root[placement="bottom"] .message[color="error"] {
    transform: none;
}

.root[label-size$="small"] > .label { width: 80px; padding-right: 10px; }
.root[label-size$="small"] > .label::after { right: 12px; }
.root[label-size$="small"] > .field { max-width: calc(100% - 80px); }
.root[label-size$="normal"] > .label { width: 120px; padding-right: 20px; }
.root[label-size$="normal"] > .label::after { right: 12px; }
.root[label-size$="normal"] > .field { max-width: calc(100% - 120px); }
.root[label-size$="large"] > .label { width: 160px; padding-right: 20px; }
.root[label-size$="large"] > .label::after { right: 12px; }
.root[label-size$="large"] > .field { max-width: calc(100% - 160px); }

.description {
    color: #999;
    margin-bottom: 10px;
}

.description:empty {
    display: none;
}

.wrap {
    position: relative;
    display: inline-block;
    max-width: 100%;
}

.root[field-size="full"] .wrap {
    display: block;
}

.extra {
    width: 24px;
    display: inline-block;
    position: relative;
    left: -12px;
}

.root[layout="block"][placement="right"] > .field > .wrap > .message {
    top: 0;
    transform: none;
}

.root[distance="extra"][label-size$="small"] > .field {
    max-width: calc(100% - 110px);
}
.root[distance="extra"][label-size$="normal"] > .field {
    max-width: calc(100% - 150px);
}
.root[distance="extra"][label-size$="large"] > .field {
    max-width: calc(100% - 190px);
}

.root[layout="none"] {
    display: inline-block;
}
.root[layout="none"] > .label {
    display: none;
}
.root[layout="none"] > .field {
    max-width: none!important;
}
.root[layout="list"] > .label {
    display: block;
    margin-bottom: 10px;
    text-align: left;
    width: 100%;
}
.root[layout="list"] > .field {
    display: block;
    max-width: 100%!important;
}
.root[layout="list"] > .label[required]::after {
    content: '*';
    color: red;
    display: inline-block;
    right: auto;
    margin-left: .5em;
}

</style>
