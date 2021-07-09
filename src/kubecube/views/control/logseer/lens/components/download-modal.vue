<template>
  <u-modal
    :visible.sync="show"
    title="日志导出"
    size="huge"
    ok-button=""
    cancel-button=""
    @close="close"
  >
    <u-form>
      <!-- <u-form-item label="选择保存路径" name="path">
               <u-input size="huge" :value="model.path" readonly @click="showDefaultFolder"></u-input>
            </u-form-item> -->
      <u-form-item
        label="日志保存格式"
        name="path"
      >
        <u-select
          v-model="model.ext"
          size="normal"
          :data="formats"
        />
      </u-form-item>
      <u-form-item
        label="导出文件条数"
        name="path"
      >
        <u-number-input
          v-model="model.capacity"
          :min="1"
          :max="total"
        /> 条
      </u-form-item>
      <!-- <u-form-item
        v-if="logseerSensitiveSwitch"
        label="导出敏感数据"
        name="path"
      >
        <u-radios v-model="model.desensitize">
          <u-radio :label="false">
            是
          </u-radio>
          <u-radio :label="true">
            否
          </u-radio>
        </u-radios>
      </u-form-item>
      <u-form-item>
        <p>导出说明：</p>
        <ol>
          <li>原始日志导出格式为.txt，CSV格式导出格式为.csv</li>
          <li>文件统一命名为：日志文件名-下载时间（年月日-时分秒）</li>
          <li>当导出文件数据量达到设置值时，会自动创建一个新的导出任务，生成新的导出文件。</li>
        </ol>
      </u-form-item> -->
      <u-submit-button
        :click="submit.bind(this)"
        place="right"
      >
        <template slot-scope="scope">
          <u-linear-layout>
            <u-button
              color="primary"
              :disabled="scope.submitting"
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
      <!-- <input style="display: none;" @change="onFileChange" ref="hiddenInput" type="file" webkitdirectory></input> -->
    </u-form>
  </u-modal>
</template>

<script>
import { mapState } from 'vuex';
export default {
    props: {
        bodyBuilder: Function,
        total: Number,
    },
    data() {
        return {
            model: {
                path: '',
                ext: 'txt',
                capacity: 1,
                desensitize: false,
            },
            formats: [
                { text: '文本', value: 'txt' },
                { text: 'csv', value: 'csv' },
            ],
            show: false,
        };
    },
    computed: mapState({
        tenantId: state => state.scope.tenant.id,
        projectId: state => state.scope.project.id,
    }),
    methods: {
        open() {
            this.show = true;
        },
        close() {
            this.show = false;
        },
        // showDefaultFolder() {
        //     this.$refs.hiddenInput.click();
        // },
        // onFileChange(e) {
        //     console.log(e.target.value);
        //     var theFiles = e.target.files;
        //     var relativePath = theFiles[0].webkitRelativePath;
        //     console.log(theFiles[0]);
        // },
        submit() {
            const {
                ext, capacity,
            } = this.model;
            const body = this.bodyBuilder();
            if (body instanceof Promise) return;
            body.size = capacity;
            const headers = {
                'x-auth-projectId': this.tenantId,
                'x-auth-tenantId': this.projectId,
                'Content-Type': 'application/json',
                Origin: '*',
            };
            let filename = '';
            const url = `/logseer/proxy/api/v1/logseer/extends/elasticsearch/export?format=${ext}`;
            // if (logseerSensitiveSwitch) {
            //     url = `/logseer/proxy/api/v1/logseer/extends/elasticsearch/export?format=${ext}&desensitize=${desensitize}`;
            // }
            return fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            }).then(response => {
                filename = /filename=(.*)/.exec(response.headers.get('content-disposition'))[1];
                return response.blob();
            }).then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                a.click();
                a.remove(); // afterwards we remove the element again
            });

        },
    },
};
</script>

<style module>
.checkbox {
    display: inline-block;
    width: 25%;
    margin-right: 0px;
}
</style>
