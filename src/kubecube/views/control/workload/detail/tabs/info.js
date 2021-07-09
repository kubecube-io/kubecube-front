import info from './info.vue';
import podinfo from './info-pod.vue';
import serviceInfo from 'kubecube/views/control/service/detail/info.vue';
import ingressInfo from 'kubecube/views/control/service/detail/ingress-info.vue';
import pvcInfo from 'kubecube/views/control/pvc/detail/info.vue';
import configInfo from 'kubecube/views/control/config/info.vue';
import logconfigInfo from 'kubecube/views/control/logseer/info.vue';
export default {
    props: {
        instance: Object,
    },
    computed: {
        workload() {
            return this.$route.params.workload;
        },
    },
    render(c) {
        const props = {
            instance: this.instance,
        };
        switch (this.workload) {
            case 'pods':
                return c(podinfo, { props });
            case 'services':
                return c(serviceInfo, { props });
            case 'ingresses':
                return c(ingressInfo, { props });
            case 'persistentvolumeclaims':
                return c(pvcInfo, { props });
            case 'secrets':
            case 'configmaps':
                return c(configInfo, { props });
            case 'logconfigs':
                return c(logconfigInfo, { props });
            default:
                return c(info, { props });
        }
    },
};
