const STAGE2START_WIDTH = 120 + 75 - 20; // 175
const START2SERVER_WIDTH = 150;
const SERVER2BRANCH_WIDTH = 75 + 60 + 30; // 165
const BRANCH2BRANCH_WIDTH = 120 + 10; // 140
const GTXSId = 'gtxs-server'; // 为分布式事务服务分配的模拟id，前后端约定一致
const EVENTTYPE = {
    CommitGlobalTx: '提交事务',
    RollbackGlobalTx: '回滚事务',
};

export default {
    name: 'u-path-table',
    props: {
        info: { type: Object, default: () => ({}) },
    },
    data() {
        const Children = this.info.Children || [];
        const branchMap = {};
        const branchNames = [];
        Children.forEach((item) => {
            const name = item.AppName;
            const type = item.TxType;
            if (type === 'txMsg') {
                branchNames.push(name);
                branchMap[item.BranchId] = branchNames.length - 1 + 2;
            } else {
                if (branchNames.includes(name))
                    branchMap[item.BranchId] = branchNames.indexOf(name) + 2;
                else {
                    branchNames.push(name);
                    branchMap[item.BranchId] = branchNames.length - 1 + 2;
                }
            }
        });
        return {
            list: [],
            points: {
                [this.info.Xid]: 0,
                [GTXSId]: 1,
                ...branchMap,
            },
            pointWidths: [STAGE2START_WIDTH, START2SERVER_WIDTH, SERVER2BRANCH_WIDTH].concat(Children.map(() => BRANCH2BRANCH_WIDTH)),
            branchNames,
            fail: this.info.Status === 5 || this.info.Status === 8 || this.info.Status === 9, // confirm || cancel 失败 || 初始化超时
        };
    },
    computed: {
        length() {
            return this.list.length;
        },
    },
    created() {
        this.list = this.getList(this.info);
    },
    methods: {
        getIndex(id) {
            return this.points[id] ? this.points[id] : 0;
        },
        getWidth(startIndex, endIndex) {
            return this.pointWidths.reduce((acc, item, index) => {
                if (startIndex > endIndex && index <= startIndex && index > endIndex)
                    acc -= item;
                if (startIndex < endIndex && index <= endIndex && index > startIndex)
                    acc += item;
                return acc;
            }, 0);
        },
        // phase 阶段
        formatEvent(event, phase = 1) {
            // 是否是通过取 InstanceName 作为展示
            const { ParentId, BranchId, FromXid, ToXid, InstanceName, DisplayContent, Status } = event;
            const isInstanceName = !!BranchId;
            const startIndex = this.getIndex(isInstanceName ? ParentId : FromXid);
            const endIndex = this.getIndex(isInstanceName ? BranchId : ToXid);

            if (isInstanceName && !ParentId)
                return;
            return {
                start: this.getWidth(0, startIndex) + STAGE2START_WIDTH,
                width: this.getWidth(startIndex, endIndex),
                text: isInstanceName ? InstanceName : DisplayContent,
                isFail: phase === 1 ? Status === 2 : [5, 8, 9].includes(Status),
            };
        },
        getList(data = {}) {
            const { Xid, OnePhaseEvents, TwoPhaseEvents, Children } = data;
            const onePhaseEvents = OnePhaseEvents.map((item) => this.formatEvent(item, 1));
            const twoPhaseEvents = TwoPhaseEvents.map((item) => this.formatEvent(item, 2));

            if (!Xid)
                return [];

            onePhaseEvents.push(...Children.map((item) => this.formatEvent(item, 1)).filter((item) => item));

            Children.forEach((item) => {
                item.OnePhaseEvents && onePhaseEvents.push(...item.OnePhaseEvents.map((item) => this.formatEvent(item, 1)));
                if (TwoPhaseEvents && TwoPhaseEvents.length > 0 && item.TwoPhaseEvents)
                    twoPhaseEvents.push(...item.TwoPhaseEvents.map((item) => this.formatEvent(item, 2)));
            });

            const list = [
                { events: onePhaseEvents, stageText: '开启事务' },
                { events: twoPhaseEvents, stageText: '' },
            ];

            const hasStage2 = !!twoPhaseEvents.length;
            if (hasStage2) {
                const type = TwoPhaseEvents[0] ? TwoPhaseEvents[0].Type : undefined;
                list[1].stageText = EVENTTYPE[type];
            }
            list[list.length - 1].isLast = true;
            return list;
        },
    },
};
