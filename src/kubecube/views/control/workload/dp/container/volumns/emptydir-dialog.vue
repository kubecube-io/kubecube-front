<template>
  <u-modal
    title="配置 EmptyDir"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="huge"
    @close="close"
  >
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <u-notice icon="warning">
        请设置合理大小的EmptyDir，避免影响同一个node上的其他工作负载
      </u-notice>
      <kube-form>
        <kube-form-item
          label="EmptyDir"
          layout="block"
          description="适用于共享运行时产生的数据、数据临时存储等场景，负载的重启、删除等操作会导致临时路径被删除"
        >
          <kube-dynamic-block
            v-model="emptyDirs"
            style="width: 580px"
            :data-template="getDataTemplate"
          >
            <template slot="column">
              <th>EmptyDir 名称</th>
              <th>介质</th>
              <th>大小</th>
            </template>
            <template slot-scope="{ model: item, index }">
              <td>
                <validation-provider
                  v-slot="{ errors }"
                  :name="`EmptyDir-name-${index}`"
                  :rules="{
                    startsWithLowercaseLetterOrNumber: true,
                    ConsistofLowercaseLetterNumbersUnderscores: true,
                    endsWithLowercaseLetterOrNumber: true,
                    noRedundance: { list: allName }
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
                      v-model="item.name"
                      size="huge"
                      :color="errors && errors[0] ? 'error' : ''"
                    />
                  </kube-form-item>
                </validation-provider>
              </td>
              <td>
                <u-select
                  v-model="item.medium"
                  size="huge"
                  :data="mediums"
                />
              </td>
              <td>
                <u-number-input
                  v-model="item.sizeLimit"
                  style="width: 90px;"
                  size="huge"
                  :min="1"
                /> MiB
              </td>
            </template>
          </kube-dynamic-block>
        </kube-form-item>

        <kube-form-item>
          <u-submit-button
            :click="submit.bind(this)"
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
                <u-button
                  @click="show = false"
                >
                  取消
                </u-button>
              </u-linear-layout>
            </template>
          </u-submit-button>
        </kube-form-item>
      </kube-form>
    </validation-observer>
  </u-modal>
</template>

<script>
import { cloneDeep } from 'lodash';
export default {
    // mixins: [ makeVModelMixin ],
    props: {
        podVolumes: Object,
    },
    data() {
        return {
            show: false,
            mediums: [
                { text: '内存', value: 'Memory' },
                { text: '磁盘', value: '' },
            ],
            emptyDirs: cloneDeep(this.podVolumes.emptyDir),
        };
    },
    computed: {
        allName() {
            return this.emptyDirs.map(m => m.name);
        },
    },
    methods: {
        open() {
            this.emptyDirs = cloneDeep(this.podVolumes.emptyDir);
            this.show = true;
        },
        close() {
            this.show = false;
        },
        getDataTemplate() {
            return {
                name: '',
                medium: 'Memory',
                sizeLimit: 300,
            };
        },
        submit() {
            this.$emit('change', cloneDeep(this.emptyDirs.filter(dir => dir.name)));
            return Promise.resolve().then(() => {
                this.show = false;
            });
        },
    },
};
</script>

<style>

</style>
