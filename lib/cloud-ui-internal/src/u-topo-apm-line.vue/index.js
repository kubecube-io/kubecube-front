import Line from '../u-topo-line.vue';
import filters from '../utils/filters/apm.js';

export default {
    filters,
    name: 'u-topo-apm-line',
    components: {
        [Line.name]: Line,
    },
    props: {
        isSnap: Boolean,
        link: Object,
        noData: Boolean,
    },
    data() {
        return {
            targetX: this.link.target.x,
            targetY: this.link.target.y,
            sourceX: this.link.source.x,
            sourceY: this.link.source.y,
        };
    },
    computed: {
        translate() {
            const link = this.link;
            let ratio = link.twoWay ? 0.7 : 0.5;
            if (link.source.type === 'service' || link.target.type === 'service') {
                if (link.twoWay)
                    ratio = 0.65;
                else {
                    if (link.source.type === 'service')
                        ratio = 0.55;
                    else
                        ratio = 0.45;
                }
            }
            return `translate(${ratio * this.targetX + (1 - ratio) * this.sourceX}, ${ratio * this.targetY + (1 - ratio) * this.sourceY})`;
        },
    },
    methods: {
        update(event) {
            Object.assign(this, event);
        },
    },
};
