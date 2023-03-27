<template>
  <el-dialog
    title="修改元信息"
    :visible.sync="show"
    @close="close"
    width="940px"
    :close-on-click-modal="false"
  >
    <i v-if="loading" class="el-icon-loading" style="font-size: 24px"/>
    <el-form v-else-if="model" ref="form" :model="model" label-position="right" label-width="120px">
      <el-form-item label="标签">
        <labelEditor
          workload="namespace"
          prefixKey="labels"
          v-model="model.metadata.labels"
          prefixProp="metadata.labels"
        />
      </el-form-item>
      <el-form-item label="注释">
        <labelEditor
          prefixKey="annotations"
          v-model="model.metadata.annotations"
          prefixProp="metadata.annotations"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="submit" :loading="submitting">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import nsService from 'kubecube/services/namespace';
import { toPlainObject as toMetadataPlainObject, toModifyObject as toMetadataModifyObject } from 'kubecube/k8s-resources/metadata.js';
import labelEditor from 'kubecube/elComponent/label-editor.vue';
export default {
    components: {
        labelEditor,
    },
    data() {
        return {
            show: false,
            loading: true,
            model: null,
            info: null,
            submitting: false,
        };
    },
    methods: {
        close() {
            this.model = null;
            this.info = null;
            this.show = false;
        },
        async loadNamespace(info) {
            this.loading = true;
            const res = await nsService.getNamespaceInstance({
                pathParams: {
                    cluster: info.cluster,
                    name: info.namespace,
                },
            });
            const metadata = toMetadataPlainObject(res);
            this.model = {
                metadata,
            };
            this.loading = false;
        },
        open(info) {
            this.show = true;
            this.info = info;
            this.loadNamespace(info);
        },
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            try {
                this.submitting = true;
                const res = await nsService.getNamespaceInstance({
                    pathParams: {
                        cluster: this.info.cluster,
                        name: this.info.namespace,
                    },
                });
                this.model.puresource = res;
                const metadata = toMetadataModifyObject(this.model);
                const data = this.model.puresource;
                data.metadata = metadata;
                await nsService.updatetNamespaceInstance({
                    pathParams: {
                        cluster: this.info.cluster,
                        name: this.info.namespace,
                    },
                    data,
                });
                this.show = false;
            } catch (error) {
                console.log(error);
            }
            this.submitting = false;
        },
    },
};
</script>

<style>

</style>
