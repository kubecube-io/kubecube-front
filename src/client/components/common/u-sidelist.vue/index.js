export default {
    name: 'u-sidelist',
    props: {
        title: String,
        list: Array,
        type: String,
    },
    data() {
        return {
            newList: this.list,
            item: {},
        };
    },
    watch: {
        list(newVal) {
            this.newList = newVal;
        },
    },
    methods: {
        selectItem(index) {
            this.newList.forEach((item_, index_) => {
                item_.status = index === index_;
                this.newList.splice(index_, 1, item_);
            });
            this.item = this.newList[index];
            this.$emit('select', this.item);
        },
        deleteItem(index) {
            this.item = this.newList[index];
            this.$emit('delete', this.item);
        },
    },
};
