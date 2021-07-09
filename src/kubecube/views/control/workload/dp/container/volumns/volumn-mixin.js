import { flatten } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';

export default {
    props: {
        volume: Object,
        prefixKey: {
            type: String,
            default: '',
        },
    },
    inject: {
        allResource: 'resources',
        updateResource: 'updateResource',
    },
    data() {
        return {
            loading: false,
            resourceService: workloadService.getAPIV1,
        };
    },
    computed: {
        resources() {
            return this.allResource[this.resource] || [];
        },
        allMountPath() {
            const paths = flatten(Object.values(this.volume).map(v => flatten(v.map(t => t.mountPath)))).filter(p => p);
            return paths;
        },
    },
    methods: {
        async update() {
            try {
                this.loading = true;
                await this.updateResource(this.resource);
                this.loading = false;
            } catch (error) {
                this.loading = false;
            }

        },
        openNewWindow(link) {
            const routeData = this.$router.resolve(link);
            window.open(routeData.href, '_blank');
        },
    },
};
