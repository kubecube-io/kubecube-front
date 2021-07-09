import TopoNode from '../u-topo-node.vue';
import rabbitmq from './assets/home-nqs.svg';

export default {
    name: 'u-topo-apm-rabbitmq',
    components: {
        [TopoNode.name]: TopoNode,
    },
    props: {
        node: Object,
    },
    data() {
        return {
            imageUrl: rabbitmq,
        };
    },
};
