<template>
  <u-modal
    title="调整副本数"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="normal"
    @close="close"
  >
    <u-form>
      <u-form-item
        label="副本数"
        label-size="small"
        :class="$style.formItem"
      >
        <u-number-input
          ref="replicas"
          v-model="replicas"
          style="width: 200px;"
          :min="0"
          size="huge normal"
        /> 个
      </u-form-item>
      <!-- <u-form-item label="" label-size="small" v-if="type === 'statefulsets' && minify">
                <u-text>被缩容的实例 IP 将默认保留，以便后续扩容继续使用。请勾选需要被释放的 IP。</u-text>
                <u-checkboxes v-model="ips">
                    <div style="display: flex; flex-direction: column;">
                        <u-checkbox v-for="ip in uselessPodStickys" :label="ip.name">{{ip.value}}</u-checkbox>
                    </div>
                </u-checkboxes>
            </u-form-item> -->
      <u-submit-button
        :click="submit.bind(this)"
        place="right"
      >
        <template slot-scope="scope">
          <u-linear-layout>
            <u-button
              color="primary"
              :disabled="!canSubmit || scope.submitting"
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
    </u-form>
  </u-modal>
</template>
<script>
import { get as getFunc, set } from 'lodash';
import { get } from 'vuex-pathify';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubecube/services/k8s-resource';

export default {
    mixins: [ Modal ],
    props: {
        instance: Object, // statefulset 需要进行部分的参数调整
    },
    data() {
        return {
            replicas: 0,
            data: null,
            available: Infinity,
            ips: [],
            stickyIPs: [],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        type() {
            return this.$route.params.workload;
        },
        minify() {
            return this.replicas < this.workload.replicas;
        },
        canSubmit() {
            return getFunc(this.data, 'spec.replicas', 0) !== this.replicas;
        },
    },
    // watch: {
    //     show() {
    //         this.replicas = getFunc(this.instance, 'spec.replicas', 0);
    //     },
    // },
    methods: {
        open(instance) {
            this.data = instance || this.instance;
            console.log(this.instance)
            this.replicas = getFunc(this.data, 'spec.replicas', 0);
            this.show = true;
        },
        async submit() {
            const data = {};
            set(data, 'spec.replicas', this.replicas);
            const name = this.data.metadata.name;
            await workloadService.patchWorkload({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.type,
                    name,
                },
                data,
            }).then(() => {
                this.$emit('refresh');
                if (!this.$route.path.endsWith('/event')) {
                    this.$router.push({ path: `/control/${this.type}/${name}/event` });
                }
                this.close();
            });
        },
    },
};
</script>

<style module>
.formItem[class] {
    margin-bottom: 30px !important;
}
</style>
