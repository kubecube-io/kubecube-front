export default {
    computed: {
        nsName() {
            return this.$route.query.nsName;
        },
    },
    watch: {
        nsName(value) {
            // 重置
            this.page = 1;
            this.totalPage = 1;
            this.list = [];
            this.loadList()
        },
    },
}