<template>
  <v-dialog
    v-model="visible"
    persistent
    max-width="290"
  >
    <v-card>
      <v-card-title class="headline">
        {{ title }}
      </v-card-title>

      <v-card-text>
        {{ content }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          color="green darken-1"
          text
          @click="onConfirm"
        >
          {{ $t('confirm') }}
        </v-btn>

        <v-btn
          color="green darken-1"
          text
          @click="onCancel"
        >
          {{ $t('cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { sync, get, dispatch } from 'vuex-pathify';

export default {
    computed: {
        title: get('confirm/title'),
        content: get('confirm/content'),
        visible: sync('confirm/visible'),
    },
    methods: {
        onConfirm() {
            dispatch('confirm/confirmResult', true);
        },
        onCancel() {
            dispatch('confirm/confirmResult', false);
        }
    }
};
</script>

<i18n locale="en">
{
  "confirm": "CONFIRM",
  "cancel": "CANCEL"
}
</i18n>

<i18n locale="zhHans">
{
  "confirm": "确定",
  "cancel": "取消"
}
</i18n>