<template>
  <u-modal
    :title="type === 'edit' ? '修改名称': '添加租户'"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="large"
    @close="close"
  >
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <kube-form ref="form">
        <validation-provider
          v-slot="{ errors }"
          name="Name"
          rules="required"
        >
          <kube-form-item
            label="租户名称"
            required
            :message="errors && errors[0]"
            maxlength="64"
            maxlength-message="不得超过 64 个字符"
          >
            <u-input
              v-model="model.spec.displayName"
              size="normal huge"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          name="DisplayName"
          rules="required"
        >
          <kube-form-item
            v-if="!isEdit"
            label="租户标识"
            required
            :message="errors && errors[0]"
          >
            <u-input
              v-model="model.metadata.name"
              size="normal huge"
              :color="errors && errors[0] ? 'error' : ''"
              maxlength="32"
              maxlength-message="不得超过 32 个字符"
              placeholder="全局唯一的标识，2-32个小写字母、数字组成、中划线-"
            />
          </kube-form-item>
        </validation-provider>


        <u-submit-button
          :click="submit.bind(this)"
          place="right"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                确定
              </u-button>
              <u-button @click="close">
                取消
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form>
    </validation-observer>
  </u-modal>
</template>

<script>
import { Modal } from '@micro-app/common/mixins';
import { clone } from 'lodash';
import scopeService from 'kubecube/services/scope';
import {
    toPlainObject,
    toK8SObject,
    toPatchObject,
} from 'kubecube/k8s-resources/scope/tenant';

export default {
    mixins: [ Modal ],
    data() {
        return {
            type: 'create',
            model: toPlainObject(),
        };
    },
    computed: {
        isEdit() {
            return this.type === 'edit';
        },
    },
    methods: {
        open(target) {
            if (target) {
                this.model = clone(target);
                this.type = 'edit';
            } else {
                this.model = toPlainObject();
                this.type = 'create';
            }
            this.show = true;
        },
        async submit() {
            if (!this.isEdit) {
                await scopeService.createScope({
                    pathParams: {
                        scope: 'tenants',
                    },
                    data: toK8SObject(this.model),
                });
            } else {
                await scopeService.patchScope({
                    pathParams: {
                        scope: 'tenants',
                        name: this.model.metadata.name,
                    },
                    data: toPatchObject(this.model),
                });
            }
            this.show = false;
            this.$emit('refresh');
        },
    },
};
</script>

<style>

</style>
