<template>
  <tr
    :class="$style.root"
    topAlign
  >
    <slot />
    <td
      v-if="!hideClose"
      :class="$style.formTd"
    >
      <u-button
        :class="$style.removeBtn"
        :disabled="disabled"
        @click="remove"
      />
      <span
        v-if="currentMessage"
        :class="$style.message"
        color="error"
        topAlign
      >
        {{ currentMessage }}
      </span>
    </td>
  </tr>
</template>

<script>
export default {
    props: {
        value: Object,
        currentMessage: String,
        disabled: Boolean,
        hideClose: Boolean,
    },
    methods: {
        remove() {
            this.$emit('remove');
        },
    },

};
</script>

<style module>
@import './table.css';
.root > td {
    vertical-align: middle;
}
.removeBtn{
    display: block;
    position: relative;
    cursor: pointer;
    margin-bottom: 0;
    font-size: 40px;
    color: #ff867f;
    height: 40px;
    line-height: 40px;
    border: none;
    padding: 0;
}
.removeBtn[disabled]{
    color: #ddd;
    cursor: not-allowed;
}
.removeBtn::before{
    content: ' ';
    width: 40px;
    height: 40px;
    display: block;
    background: url('./tb-del.png') center/100% 100% no-repeat;
}

.message {
    position: absolute;
    display: inline-block;
    margin-left: 10px;
    padding: 0 10px;
    line-height: 26px;
    height: 26px;
    font-size: 12px;
    white-space: nowrap;
    right: -10px;
    top: 50%;
    /* margin-top: -25px; */
    transform: translate(100%, -18%);
}
.message[topAlign] {
    top: 30px;
}
.message:after {
    content: "";
    position: absolute;
    right: 100%;
    top: 8px;
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-right: 4px solid #ff867f;
    border-bottom: 4px solid transparent;
}

.message[color="error"] {
    background-color: #ff867f;
    color: #fff;
}

.message[color="error"]:after {
    border-right-color: #ff867f;
}

.error {
    height: 22px;
    color: #ff867f;
    margin-top: -24px;
}

</style>
