<template>
  <kube-valve
    name="project"
    :request="getProjects"
    :valve="modelValue"
  >
    <el-select 
        v-if="list.length > 0"
        v-model="modelValue"
        :disabled="disabled"
        filterable
    >
        <el-option
            v-for="item in list"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
        />
    </el-select>
    <el-input
        v-else
        disabled
        placeholder="暂无项目"
    />
  </kube-valve>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import userService from 'kubecube/services/user';
import {
    toPlainObject as toProjectPlainObject,
} from 'kubecube/k8s-resources/scope/project';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
import {
    ROLES,
} from 'kubecube/utils/constance';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        tenant: String,
        noEmpty: Boolean,
        auth: {
            type: String,
            default: 'readable',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            list: [],
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
        userRole: get('scope/userRole'),
        isPlatform() {
            return this.userRole[ROLES.PLATFORM_ADMIN];
        },
        isTenant() {
            return this.userRole[ROLES.TENANT_ADMIN];
        },
        isProject() {
            return this.userRole[ROLES.PROJECT_ADMIN];
        },
        modelValue: {
            get() {
                return getFunc(this.model, 'value', null);
            },
            set(val) {
                this.model = this.list.find(m => m.value === val);
            },
        },
    },
    methods: {
        async getProjects() {
            await this.$nextTick();
            if (!this.tenant) return;

            const response = await userService.getUserProjects({
                params: {
                    // user: this.user,
                    tenant: this.tenant,
                    // labelSelector: `kubecube.io/tenant=${this.tenant.value}`,
                    auth: this.auth,
                },
            });
            const projects = (response.items || []).map(i => {
                const m = toProjectPlainObject(i);
                return {
                    text: m.spec.displayName,
                    value: m.metadata.name,
                    ...m,
                };
            });
            if ((this.isPlatform || this.isTenant) && !this.noEmpty) {
                projects.unshift({ text: '不指定', value: '' });
            }
            this.list = projects;

            setValueIfListNotPresent({
                list: this.list,
                path: 'value',
                current: getFunc(this.model, 'value'),
            }, val => {
                this.modelValue = getFunc(val, 'value');
            });
        },
    },

};
</script>

<style>

</style>
