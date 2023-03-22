import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import monitor from 'kubecube/views/control/monitor/monitor.vue';
import monitorService from 'kubecube/services/monitor';
import {
    toPlainObject as toMonitorPlainObject,
} from 'kubecube/k8s-resources/monitor/index.js';
export default {
    extends: monitor,
    computed: {
        scope() {
            return {};
        },
        dashboard() {
            return this.$route.params.dashboard;
        },
        controlClusterList: get('scope/controlClusterList'),
    },
    methods: {
        async load() {
            this.loading = true;
            const response = await monitorService.getInnerDashboardByQuery({
                pathParams: {
                    cluster: this.controlClusterList[0].clusterName,
                },
                params: {
                    selector: `metadata.name=${this.dashboard}`,
                },
            });
            const resolved = toMonitorPlainObject(getFunc(response, 'items[0]'));
            this.title = resolved.spec.title;
            this.variables = resolved.spec.variables || [];
            this.rows = resolved.spec.rows || [];
            this.pipeSeq = this.variables.map(v => v.name).join(' > ');
            if (this.variables.length === 0) {
                this.pipeLoading = false;
            }
            this.loading = false;
        },
    },
};
