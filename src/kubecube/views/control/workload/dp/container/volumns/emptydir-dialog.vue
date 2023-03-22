<template>
  <el-dialog
    title="配置 EmptyDir"
    :visible.sync="show"
    width="800px"
    @close="close"
    :close-on-click-modal="false"
  >
    <el-alert title="请设置合理大小的EmptyDir，避免影响同一个node上的其他工作负载" type="warning" show-icon :closable="false"/>
    <el-form ref="form" :model="model" label-position="right" label-width="120px">
      <el-form-item label="EmptyDir">
        <div style="color: #999;">适用于共享运行时产生的数据、数据临时存储等场景，负载的重启、删除等操作会导致临时路径被删除</div>
        <dynamicBlock
          v-model="model.emptyDirs"
          :getDefaultItem="getDataTemplate"
          :columns="[
              {
                  title: 'EmptyDir 名称',
                  dataIndex: 'name',
              },
              {
                  title: '介质',
                  dataIndex: 'medium'
              },
              {
                  title: '大小',
                  dataIndex: 'sizeLimit'
              },
              {
                  title: '',
                  dataIndex: 'unit',
                  width: '60px'
              }
          ]"
        >
          <template v-slot:name="{record, index}">
            <el-form-item 
              label=""
              :prop="`emptyDirs.${index}.name`"
              :rules="[
                validators.startsWithLowercaseLetterOrNumber(false),
                validators.consistofLowercaseLetterNumbersUnderscores(false),
                validators.endsWithLowercaseLetterOrNumber(false),
                validators.noRedundance(allName, false)
              ]"
            >
              <el-input
                v-model="record.name"
              />
            </el-form-item>
          </template>
          <template v-slot:medium="{record}">
            <el-select v-model="record.medium" placeholder="请选择" filterable>
              <el-option
                v-for="item in mediums"
                :key="item.value"
                :label="item.text"
                :value="item.value">
              </el-option>
            </el-select>
          </template>
          <template v-slot:sizeLimit="{record}">
            <div style="display: flex">
              <el-input-number v-model="record.sizeLimit" controls-position="right" :min="1"/>
            </div>
          </template>
          <template slot="unit">
            MiB
          </template>
        </dynamicBlock>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { cloneDeep } from 'lodash';
import * as validators from 'kubecube/utils/validators';
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
            validators,
            model: {
                emptyDirs: cloneDeep(this.podVolumes.emptyDir),
            },
        };
    },
    computed: {
        allName() {
            return this.model.emptyDirs.map(m => m.name);
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
        async submit() {
            // 触发校验
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.$emit('change', cloneDeep(this.model.emptyDirs.filter(dir => dir.name)));
            this.close();
        },
    },
};
</script>

<style>

</style>
