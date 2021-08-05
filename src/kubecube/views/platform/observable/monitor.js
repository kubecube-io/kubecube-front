import { get } from 'lodash';
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
    },
    methods: {
        async load() {
            this.loading = true;
            const response = await monitorService.getInnerDashboardByQuery({
                params: {
                    selector: `metadata.name=${this.dashboard}`,
                },
            });
            const resolved = toMonitorPlainObject(get(response, 'items[0]'));
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
