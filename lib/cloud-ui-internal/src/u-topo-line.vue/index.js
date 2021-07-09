import { Emitter } from 'cloud-ui.vusion';

export default {
    name: 'u-topo-line',
    mixins: [Emitter],
    props: {
        link: Object,
    },
    data() {
        return {
            targetX: this.link.target.x,
            targetY: this.link.target.y,
            sourceX: this.link.source.x,
            sourceY: this.link.source.y,
            twoWay: this.link.twoWay, // todo 双向标记应该在link数据梳理中完成，还是在path对象完成后进行？？
        };
    },
    mounted() {
        this.dispatch('u-topo', 'add-line', {
            sender: this,
            link: this.link,
            dom: this.$refs.node,
        });
    },
    computed: {
        path() {
            const link = this.link;
            const { targetX, targetY, sourceX, sourceY } = this;
            const { source, target } = link;
            const distance = Math.sqrt((targetX - sourceX) * (targetX - sourceX) + (targetY - sourceY) * (targetY - sourceY));
            const sourceRadius = link.source.radius || 0;
            const targetRadius = link.target.radius || 0;
            // 箭头位于线段上的比率（1/2标示中点）
            let ratio = this.twoWay ? 0.7 : 0.5;
            if (link.source.type === 'service' || link.target.type === 'service') {
                if (this.twoWay)
                    ratio = 0.65;
                else {
                    if (link.source.type === 'service')
                        ratio = 0.55;
                    else
                        ratio = 0.45;
                }
            }
            const sourceXd = sourceX + (targetX - sourceX) * (sourceRadius / distance);
            const sourceYd = sourceY + (targetY - sourceY) * (sourceRadius / distance);
            const targetXd = targetX - (targetX - sourceX) * (targetRadius / distance);
            const targetYd = targetY - (targetY - sourceY) * (targetRadius / distance);
            return [
                'M' + sourceXd + ',' + sourceYd,
                'L' + (ratio * targetXd + (1 - ratio) * sourceXd) + ',' + (ratio * targetYd + (1 - ratio) * sourceYd),
                'L' + targetXd + ',' + targetYd,
            ].join(' ');
        },
    },
    methods: {
        updateSource(x, y) {
            this.sourceX = x;
            this.sourceY = y;
            this.emitUpdate();
        },
        updateTarget(x, y) {
            this.targetX = x;
            this.targetY = y;
            this.emitUpdate();
        },
        update(topoId, x, y) {
            if (this.link.target.topoId === topoId)
                this.updateTarget(x, y);
            if (this.link.source.topoId === topoId)
                this.updateSource(x, y);
            this.emitUpdate();
        },
        emitUpdate() {
            const { targetX, targetY, sourceX, sourceY } = this;
            this.$emit('update', {
                targetX, targetY, sourceX, sourceY,
            });
        },
    },
};
