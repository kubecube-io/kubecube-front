<template>
  <u-modal
    title="编辑标签"
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
      <label-editor
        v-model="model"
        style="margin-bottom: 20px;"
      />
      <u-submit-button
        ref="submit"
        :click="submit.bind(this)"
        place="right"
      >
        <template slot-scope="scope">
          <u-linear-layout>
            <u-button
              :disabled="scope.submitting || invalid"
              :icon="scope.submitting ? 'loading' : null "
              color="primary"
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
    </validation-observer>
  </u-modal>
</template>

<script>
import { get, cloneDeep } from 'lodash';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubecube/services/k8s-resource';
import labelEditor from 'kubecube/component/global/k8s/label-editor';
import { ignoredKeys } from 'kubecube/utils/constance';
export default {
    components: {
        labelEditor,
    },
    mixins: [ Modal ],
    props: {
        instance: Object,
    },
    data() {
        return {
            model: [],
            raw: null,
        };
    },
    methods: {
        open(item) {
            console.log(item);
            const labels = get(item, 'metadata.labels', []);
            this.model = labels.map(i => ({
                ...i,
                disabled: ignoredKeys.some(k => i.key.startsWith(k)),
            }));

            this.raw = cloneDeep(item);
            this.show = true;
        },
        async submit() {
            const labels = {};
            this.model.forEach(l => {
                labels[l.key] = l.value;
            });
            const data = { metadata: { labels } };
            await workloadService.modifyResourceWithoutNamespace({
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'nodes',
                    name: get(this.raw, 'metadata.name'),
                },
                data,
            });
            this.show = false;
            this.$emit('refresh');
        },
    },
};
</script>

<style>

</style>
