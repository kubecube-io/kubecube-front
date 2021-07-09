import UBlockList from '@micro-app/common/library/common/block-list/u-block-list.vue';

export default {
    components: {
        UBlockList,
    },
    data() {
        return {
            keyword: '',
            sortField: '',
            sortDirection: '',
            listVm: undefined,
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.listVm = this.getListVm(this.$children);
        });
    },
    methods: {
        refresh() {
            this.listVm.refresh();
        },
        goToPage(page) {
            this.listVm.goToPage(page);
        },
        goToPageWithLoading(page) {
            this.listVm.goToPageWithLoading(page);
        },
        onSearch(e) {
            this.keyword = e;
            this.goToPageWithLoading(1);
        },
        onSortChange(e) {
            const { label, order } = e;
            this.sortField = label;
            this.sortDirection = order;
            this.refresh();
        },
        getListVm(children) {
            for (const vm of children) {
                if (vm.$options.name === 'u-block-list')
                    return vm;
                else {
                    const res = this.getListVm(vm.$children);
                    if (res)
                        return res;
                }
            }
        },
    },
};
