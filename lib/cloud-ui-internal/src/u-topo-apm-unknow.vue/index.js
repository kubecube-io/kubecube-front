import TopoNode from '../u-topo-node.vue';
import unkonw from './assets/cloud-fill.svg';

export default {
    name: 'u-topo-apm-unknow',
    components: {
        [TopoNode.name]: TopoNode,
    },
    props: {
        node: Object,
    },
    data() {
        return {
            imageUrl: unkonw,
        };
    },
};
