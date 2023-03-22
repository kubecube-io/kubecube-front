<template>
  <el-dialog
    title="调整副本数"
    :visible.sync="show"
    width="500px"
    :custom-class="$style.dialog"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-form>
      <el-form-item
        label="副本数"
        label-position="right"
        label-width="120px"
      >
        <el-input-number
          ref="replicas"
          v-model="replicas"
          :min="0"
          controls-position="right"
          step-strictly
          style="width:300px"
        />
        <span style="margin-left:8px">个</span>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取 消</el-button>
      <el-button :disabled="!canSubmit" type="primary" @click="submit" :loading="submitLoading">确 定</el-button>
    </div>
  </el-dialog>
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
            submitLoading: false,
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
            console.log(this.instance);
            this.replicas = getFunc(this.data, 'spec.replicas', 0);
            this.show = true;
        },
        async submit() {
            const data = {};
            set(data, 'spec.replicas', this.replicas);
            this.submitLoading = true;
            const name = this.data.metadata.name;
            try {
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
            } catch (error) {
                console.log(error);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style module>
.formItem[class] {
    margin-bottom: 30px !important;
}
</style>
