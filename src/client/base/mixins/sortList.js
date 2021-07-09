export default {
    data() {
        return {
            formSort: this.resetFormSort(),
            loadListFunctionName: 'loadList',
        };
    },
    methods: {
        sort(event) {
            Object.assign(this.formSort, { asc: event.order === 'asc', sortby: event.label });
            this[this.loadListFunctionName] && this[this.loadListFunctionName]();
        },
        search(value) {
            this.formSort.filterby = 'name';
            this.formSort.filtervalue = value;
            // 重置
            this.page = 1;
            this.form && (this.form.offset = 0);

            this[this.loadListFunctionName] && this[this.loadListFunctionName]();
        },
        resetFormSort() {
            return {
                filterby: 'name',
                filtervalue: '',
                sortby: 'createTime',
                asc: false,
            };
        },
    },
};
