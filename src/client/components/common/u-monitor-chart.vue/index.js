import MonitorChart from '@necfe/cloud-ui-internal/src/u-monitor-chart.vue';
import { getApmJvm, getNcsMonitor, getApmDb, getZipkinMonitor, getApmService } from './services/apm.js';
export default {
    name: 'u-monitor-chart',
    mixins: [MonitorChart],
    props: {
        filters: Object,
    },
    methods: {
        defaultProcessor() {
            const type = this.type;
            const options = this.options;
            const metrics = this.metrics;
            const filters = this.filters;
            switch (type) {
                case 'apm':
                    return getApmJvm({
                        filters,
                        options,
                        metrics,
                    });
                case 'apm-service':
                    return getApmService({
                        filters,
                        options,
                        metrics,
                    });
                case 'apm-jvm':
                    return getApmJvm({
                        filters,
                        options,
                        metrics,
                    });
                case 'ncs':
                    return getNcsMonitor({
                        options,
                        metrics,
                    });
                case 'apm-db':
                    return getApmDb({
                        filters,
                        options,
                        metrics,
                    });
                case 'zipkin':
                    return getZipkinMonitor({
                        options,
                    });
                default:
                    return Promise.reject().then(() => {
                        console.error('当前的图表引用没有指定service，要使用本图表处理数据，请先本地化自定义defaultProcessor');
                    });
            }
        },
    },
};
