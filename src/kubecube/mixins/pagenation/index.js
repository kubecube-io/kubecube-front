export default {
    data() {
        return {
            pagenation: {
                pageNum: 1,
                pageSize: 10,
                sortOrder: '',
                sortName: undefined,
                selector: '',
                sortFunc: 'string',
            },
        };
    },
    computed: {
        defaultSort() {
            const valueMap = { desc: 'descending', asc: 'ascending' };
            return {
                prop: this.pagenation.sortName,
                order: valueMap[this.pagenation.sortOrder],
            };
        },
    },
    methods: {
        selectPage($event) {
            this.pagenation.pageNum = $event.page;
            this.pagenation.pageSize = $event.pageSize;
        },
        calculatePages(total) {
            return Math.ceil(total / this.pagenation.pageSize);
        },
        pageSizeChange(pageSize) {
            this.pagenation.pageSize = pageSize;
        },
        pageNumChange(pageNum) {
            console.log(pageNum);
            this.pagenation.pageNum = pageNum;
        },
        tableSortChange({ prop, order }) {
            const valueMap = { descending: 'desc', ascending: 'asc' };
            this.pagenation.sortName = `${prop}`;
            this.pagenation.sortOrder = valueMap[order];
            this.pagenation.sortFunc = prop === 'metadata.creationTimestamp' ? 'time' : 'string';
        },
    },
};
