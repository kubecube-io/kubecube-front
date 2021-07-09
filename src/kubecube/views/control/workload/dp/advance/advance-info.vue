<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form>
      <kube-form-item
        v-if="workload === 'jobs' || workload === 'cronjobs'"
        label="重启策略"
        required
      >
        <u-capsules
          v-model="model.podTemplate.spec.restartPolicy"
          :data="restartPolicyList"
        />
      </kube-form-item>


      <repo-secret-config v-model="model.podTemplate.spec.imagePullSecrets" />
      <kube-form-item
        label="标签"
        layout="block"
      >
        <kube-label-editor
          v-model="model.podTemplate.metadata.labels"
          style="width: 750px"
        />
      </kube-form-item>
      <kube-form-item
        label="注释"
        layout="block"
      >
        <kube-label-editor
          v-model="model.podTemplate.metadata.annotations"
          style="width: 750px"
        />
      </kube-form-item>
      <deploy-config v-model="model.podTemplate.spec.deploymentStrategy" />
      <template v-if="['cronjobs', 'jobs'].includes(workload)">
        <job-config
          v-if="workload === 'jobs'"
          v-model="model.spec"
        />
        <job-config
          v-else
          v-model="model.jobTemplate"
        />
      </template>

      <template v-if="workload === 'cronjobs'">
        <kube-form-item
          label="定时规则"
          layout="block"
        >
          <kube-form style="width: 750px">
            <kube-form-item label="并发策略" required>
              <u-note slot="label">
                Forbid: 在前一个任务未完成时，不创建新任务<br>
                Allow: 定时任务不断创建新的任务，会抢占集群资源<br>
                Replace: 当到达新任务创建时间点，而前一个任务未完成时，新的任务会取代前一个任务<br>
              </u-note>
              <u-capsules
                v-model="model.spec.concurrencyPolicy"
                :data="concurrencyPolicyList"
              />
            </kube-form-item>
            <validation-provider
              v-slot="{ errors }"
              name="cronjob-schedule"
              rules="linuxCronPattern|required"
              required
            >
              <kube-form-item
                label="定时调度设置"
                :message="errors && errors[0]"
                layout="block"
              >
                <u-input
                  v-model="model.spec.schedule"
                  size="large"
                  :color="errors && errors[0] ? 'error' : ''"
                  placeholder="填写正确的 Linux Cron时间格式"
                />
                <div>
                  下次执行任务的时间为: {{ parsedTime }}
                </div>
              </kube-form-item>
            </validation-provider>
            <kube-form-item label="任务记录">
              <kube-form-item
                label="保留执行成功任务的个数"
                layout="list"
              >
                <u-number-input
                  :min="1"
                  :v-model="model.spec.successfulJobsHistoryLimit"
                />个
              </kube-form-item>
              <kube-form-item
                label="保留执行失败任务的个数"
                layout="list"
              >
                <u-number-input
                  v-model="model.spec.failedJobsHistoryLimit"
                  :min="1"
                />个
              </kube-form-item>
            </kube-form-item>
            <validation-provider
              v-slot="{ errors }"
              name="cronjob-startingDeadlineSeconds"
              rules="ConsistofNumber"
            >
              <kube-form-item
                :message="errors && errors[0]"
                label="任务启动截止时间"
                layout="block"
              >
                <u-note slot="label">
                  并发策略为Allow时，任务启动截止时间未设置，任务也至少执行一次；<br>
                  并发策略为Forbid时，当到达新任务创建时间点，而不能创建新任务时，将被标记为错过调度。<br>
                  当错过调度次数累计达到100次，定时任务将不再启动新任务。<br>
                </u-note>
                <u-input
                  v-model="model.spec.startingDeadlineSeconds"
                  :color="errors && errors[0] ? 'error' : ''"
                /> 秒
              </kube-form-item>
            </validation-provider>
          </kube-form>
        </kube-form-item>
      </template>

      <kube-form-item>
        <u-submit-button
          :click="submit.bind(this)"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                @click="$emit('go', -1)"
              >
                上一步
              </u-button>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                {{ isEdit ? '立即修改' : '立即创建' }}
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form-item>
    </kube-form>
  </validation-observer>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import parser from 'cron-parser';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import repoSecretConfig from './repo-secret-config.vue';
import deployConfig from './deploy-config.vue';
import jobConfig from './job-config.vue';
export default {
    components: {
        repoSecretConfig,
        deployConfig,
        jobConfig,
    },
    mixins: [ makeVModelMixin ],
    props: {
        resolveData: Function,
    },
    data() {
        return {
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
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
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
    methods: {
        async submit() {
            await this.resolveData();
            this.$router.push({ path: `/control/${this.workload}/list` });
        },
    },
};
</script>

<style>

</style>
