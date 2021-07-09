<template>
  <u-modal
    title="批量导入"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="large"
    @close="close"
  >
    <u-form>
      <u-form-item
        ref="file"
        label-size="small"
        label="模板文件"
        placement="bottom"
      >
        <u-input
          v-model="model.fileName"
          :class="$style.input"
          readonly
        />
        <u-uploader
          :class="$style.uploader"
          extensions="csv"
          @before-send="onUpload($event)"
          @error="uploadError($event)"
        >
          <u-link>选择文件</u-link>
        </u-uploader>
      </u-form-item>
      <u-form-item
        ref="file"
        label-size="small"
        label=""
        placement="bottom"
      >
        <u-link @click="download">
          下载模板
        </u-link>
      </u-form-item>
      <u-form-item
        v-if="response"
        label=""
      >
        <div>
          <span>成功: {{ response.successCount }}</span>
          <span>失败: {{ response.failedCount }}</span>
        </div>
        <ul>
          <li
            v-for="msg in response.failedMessageList"
            :key="msg"
          >
            {{ msg }}
          </li>
        </ul>
      </u-form-item>

      <u-submit-button
        ref="submit"
        :click="submit.bind(this)"
        place="right"
      >
        <template slot-scope="scope">
          <u-linear-layout>
            <u-button
              color="primary"
              :disabled="!model.fileName || scope.submitting"
              :icon="scope.submitting ? 'loading' : ''"
              @click="scope.submit"
            >
              上传
            </u-button>
            <u-button @click="show = false">
              取消
            </u-button>
          </u-linear-layout>
        </template>
      </u-submit-button>
    </u-form>
  </u-modal>
</template>

<script>
import { Modal } from '@micro-app/common/mixins';
import jsFileDownload from 'js-file-download';
import userService from 'kubecube/services/user';
export default {
    mixins: [ Modal ],
    data: () => ({
        model: {
            userInfoFile: null,
            type: 'replace',
            fileName: '',
        },
        response: null,
        isError: false,
        loading: false,
    }),
    methods: {
        open() {
            Object.assign(this, {
                model: {
                    userInfoFile: null,
                    type: 'replace',
                    fileName: '',
                },
                response: null,
                isError: false,
                loading: false,
            });
            this.show = true;
        },
        onUpload(event) {
            event.preventDefault();
            // 重置
            const ref = this.$refs.file;
            ref.color = '';

            this.model.userInfoFile = event.file;
            this.model.fileName = event.file.name;
            console.log(event);
        },
        uploadError(e) {
            const ref = this.$refs.file;
            ref.color = 'error';
            if (e.name === 'ExtensionError') {
                ref.currentMessage = `只能上传 ${e.extensions.join(', ')} 类型的文件！`;
            } else { ref.currentMessage = e.message; }
        },
        async download() {
            const response = await userService.getUserTemplate();
            jsFileDownload(response.data, 'UserTemplate.csv');
        },
        async submit() {
            if (!this.model.userInfoFile) {
                const ref = this.$refs.file;
                ref.color = 'error';
                ref.currentMessage = '需要选择文件';
            } else {
                this.loading = true;
                const formData = new FormData();
                formData.append('userInfoFile', this.model.userInfoFile);
                const response = await userService.batchCreateUser({
                    data: formData,
                });
                this.response = response;
                this.loading = false;
            }

        },
    },
};
</script>

<style module>
.wrap {
    margin-bottom: 15px;
}
.title {
    color: #999;
    margin-bottom: 10px;
}
.uploader {
    margin-left: 10px;
}
.input[class] {
    width: 330px;
}
.error {
    color: $brand-error;
}
</style>
