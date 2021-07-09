export default {
    data() {
        return {
            pagenation: {
                pageNum: 1,
                pageSize: 10,
                sortOrder: '',
                sortName: undefined,
                selector: '',
            },
        };
    },
    methods: {
        selectPage($event) {
            this.pagenation.pageNum = $event.page;
            this.pagenation.pageSize = $event.pageSize;
        },
        calculatePages(total) {
            return Math.ceil(total / this.pagenation.pageSize);
        },
    },
};
