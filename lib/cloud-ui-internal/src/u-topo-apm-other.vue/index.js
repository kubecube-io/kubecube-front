import TopoNode from '../u-topo-node.vue';
import service from './assets/home-micro.svg';
import database from './assets/home-database.svg';
import redis from './assets/home-cache.svg';
import memcache from './assets/memcache.svg';
import node from './assets/home-micro.svg';

export default {
    name: 'u-topo-apm-other',
    components: {
        [TopoNode.name]: TopoNode,
    },
    props: {
        node: Object,
    },
    data() {
        return {
            imageUrl: {
                service,
                mysql: database,
                database,
                redis,
                memcache,
                node,
            },
        };
    },
};
