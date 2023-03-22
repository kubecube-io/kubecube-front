<template>
  <div>
    <el-form ref="form" :model="model" :rules="rules" label-position="right" label-width="160px">
      <el-form-item
        v-if="workload === 'jobs' || workload === 'cronjobs'"
        label="重启策略"
        prop="podTemplate.spec.restartPolicy"
      >
        <el-radio-group v-model="model.podTemplate.spec.restartPolicy">
          <el-radio-button v-for="item in restartPolicyList" :label="item.value" :key="item.value">{{item.text}}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <repo-secret-config v-model="model.podTemplate.spec.imagePullSecrets" />
      <el-form-item label="标签">
        <labelEditor
          :workload="workload"
          :projectName="project"
          prefixKey="labels"
          :serviceList="serviceList"
          v-model="model.podTemplate.metadata.labels"
          prefixProp="podTemplate.metadata.labels"
        />
      </el-form-item>
      <el-form-item label="注释">
        <labelEditor
          :workload="''"
          prefixKey="annotations"
          v-model="model.podTemplate.metadata.annotations"
          prefixProp="podTemplate.metadata.annotations"
        />
      </el-form-item>
      <el-form-item v-if="workload === 'deployments'">
        <template slot="label">
          HostNetwork
          <el-tooltip effect="dark" content="为避免副本迁移导致端口冲突，请设置节点亲和性保证副本调度到固定节点。hostnetwork模式下，负载使用service和ingress无效" placement="right" popper-class="ncs-el-tooltip-popper">
            <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
          </el-tooltip>
        </template>
        <el-switch v-model="model.podTemplate.spec.hostNetwork"/>
      </el-form-item>
      <deploy-config
        v-model="model.podTemplate.spec.deploymentStrategy" 
        :hostNetworkSupport="model.podTemplate.spec.hostNetwork"
        prefixProp="podTemplate.spec.deploymentStrategy"
      />
      <template v-if="['cronjobs', 'jobs'].includes(workload)">
        <job-config
          v-if="workload === 'jobs'"
          v-model="model.spec"
          prefixProp="spec"
        />
        <job-config
          v-else
          v-model="model.jobTemplate"
          prefixProp="jobTemplate"
        />
      </template>
      <template v-if="workload === 'cronjobs'">
        <el-form-item
          label="定时规则"
        >
          <el-form-item
            :prop="`spec.concurrencyPolicy`"
            label=""
            :rules="[
              validators.required(),
            ]"
            style="display: flex;margin-bottom: 22px"
          >
            <template slot="label">
              并发策略
              <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
                <div slot="content">
                  Forbid: 在前一个任务未完成时，不创建新任务<br>
                  Allow: 定时任务不断创建新的任务，会抢占集群资源<br>
                  Replace: 当到达新任务创建时间点，而前一个任务未完成时，新的任务会取代前一个任务<br>
                </div>
                <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
              </el-tooltip>
            </template>
            <el-radio-group v-model="model.spec.concurrencyPolicy">
              <el-radio-button v-for="item in concurrencyPolicyList" :label="item.value" :key="item.value">{{item.text}}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            :prop="`spec.schedule`"
            label="定时调度设置"
            :rules="[
              validators.required(),
              validators.linuxCronPattern(false),
              validators.fixedFieldNum(5, ' ', false),
            ]"
            style="margin-bottom:22px"
          >
            <el-input
              v-model="model.spec.schedule"
              placeholder="填写正确的 Linux Cron时间格式"
            />
            <div>
              下次执行任务的时间为: {{ parsedTime }}
            </div>
          </el-form-item>
          <el-form-item
            label="任务记录"
          >
            <el-form-item
              label="保留执行成功任务的个数"
              :class="$style.columnFormItem"
            >
              <el-input-number
                v-model="model.spec.successfulJobsHistoryLimit"
                controls-position="right"
                :min="1"
                style="width: 300px;"
                :step-strictly="true"
              />
              <span style="margin-left:8px">个</span>
            </el-form-item>
            <el-form-item
              label="保留执行失败任务的个数"
              :class="$style.columnFormItem"
            >
              <el-input-number
                v-model="model.spec.failedJobsHistoryLimit"
                controls-position="right"
                :min="1"
                style="width: 300px;"
                :step-strictly="true"
              />
              <span style="margin-left:8px">个</span>
            </el-form-item>
          </el-form-item>
          <el-form-item
            label="任务启动截止时间"
            style="margin-bottom:22px"
            :prop="`spec.startingDeadlineSeconds`"
            :rules="[
              validators.consistofNumber(false),
            ]"
          >
            <template slot="label">
              任务启动截止时间
              <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
                <div slot="content">
                  并发策略为Allow时，任务启动截止时间未设置，任务也至少执行一次；<br>
                  并发策略为Forbid时，当到达新任务创建时间点，而不能创建新任务时，将被标记为错过调度。<br>
                  当错过调度次数累计达到100次，定时任务将不再启动新任务。<br>
                </div>
                <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
              </el-tooltip>
            </template>
            <el-input v-model="model.spec.startingDeadlineSeconds" style="width: 300px;"/>
            <span style="margin-left:8px">秒</span>
          </el-form-item>
        </el-form-item>
      </template>
      <el-form-item>
          <el-button
            color="primary"
            @click="$emit('go', -1)"
          >
            上一步
          </el-button>
          <el-button
            type="primary"
            @click="submit"
            :loading="submitLoading"
          >
            {{ isEdit ? '立即修改' : '立即创建' }}
          </el-button>
        </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import parser from 'cron-parser';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import repoSecretConfig from './repo-secret-config.vue';
import deployConfig from './deploy-config.vue';
import jobConfig from './job-config.vue';
import workloadService from 'kubecube/services/k8s-resource';
import { nsfDeploymentAnnotations } from 'kubecube/utils/constance';
import labelEditor from 'kubecube/elComponent/label-editor.vue';
import * as validators from 'kubecube/utils/validators';
export default {
    components: {
        repoSecretConfig,
        deployConfig,
        jobConfig,
        labelEditor,
    },
    mixins: [ makeVModelMixin ],
    props: {
        resolveData: Function,
    },
    data() {
        return {
            validators,
            showDeployConfig: true,
            nsfDeploymentAnnotations,
            restartPolicyList: [
                // { value: 'Always', text: 'Always' },
                { value: 'OnFailure', text: 'OnFailure' },
                { value: 'Never', text: 'Never' },
            ],
            concurrencyPolicyList: [
                { text: 'Forbid', value: 'Forbid' },
                { text: 'Allow', value: 'Allow' },
                { text: 'Replace', value: 'Replace' },
            ],
            serviceList: [],
            rules: {
                'podTemplate.spec.restartPolicy': [
                    { required: true, message: '重启策略不能为空', trigger: 'blur' },
                ],
            },
            submitLoading: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        project: get('scope/project@value'),
        workload() {
            return this.$route.params.workload;
        },
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
        parsedTime() {
            const schedule = getFunc(this.model, 'spec.schedule');
            if (schedule) {
                try {
                    const interval = parser.parseExpression(schedule);
                    return interval.next().toString();
                } catch (error) {
                    return '';
                }

            }
            return '';
        },
    },
    async created() {
        if (this.workload === 'deployments') {
            const serviceList = await this.loasServiceList();
            const nsfAppLabel = (this.model.podTemplate.metadata.labels || []).find(item => item.key === 'nsf.skiff.netease.com/app');
            if (nsfAppLabel) {
                nsfAppLabel.selectValues = serviceList;
            }
        }
    },
    methods: {
        async loasServiceList() {
            const res = await workloadService.getAPIV1({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'services',
                },
                params: {
                    pageNum: 1,
                    pageSize: 999,
                },
            });
            this.serviceList = (res.items || []).map(item => ({ text: item.metadata.name, value: item.metadata.name }));
            return this.serviceList;
        },
        async submit() {
            // 触发校验
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.submitLoading = true;
            try {
                await this.resolveData();
                this.$router.push({ path: `/control/${this.workload}/list` });
            } catch (err) {
                this.$globalErrorModal(getFunc(err, 'details.causes[0]') || err);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style module>
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubecube/assets/question.svg');
    cursor: pointer;
}
.columnFormItem {
  display: flex;
  flex-direction: column;
  margin-bottom: 22px !important;
}
.columnFormItem>:global(.el-form-item__content) {
  margin-left: 0 !important;
}
.columnFormItem>:global(.el-form-item__label) {
  align-self: start;
  width: auto !important;
}
</style>
