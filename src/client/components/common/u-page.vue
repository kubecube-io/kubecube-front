<template>
  <div :class="$style.clearfix">
    <div :class="$style.wrap">
      <u-select
        :class="$style.select"
        size="small mini"
        :data=" type === 'cdn' ? pageCdn : pageType"
        :value="size"
        @select="setPageSize"
      />
      <span :class="$style.pages">条/页</span>
      <span :class="$style.items">共{{ count }}项</span>
      <u-pagination
        :class="$style.page"
        :total="total"
        :page="crtPage"
        @select="setPageNum"
      />
    </div>
  </div>
</template>

<script>
export default {
    name: 'UPage',
    props: {
        total: { type: [ Number, String ], default: 1 },
        type: String,
        pageSize: { type: [ String, Number ], default: 20 },
        count: { type: [ String, Number ], default: 0 },
        page: { type: [ Number, String ], default: 1 },
    },
    data() {
        return {
            pageType: [
                { text: '10', value: 10 },
                { text: '20', value: 20 },
                { text: '50', value: 50 },
                { text: '100', value: 100 },
            ],
            pageCdn: [
                { text: '20', value: 20 },
            ],
            size: this.pageSize,
            crtPage: this.page,
        };
    },
    watch: {
        pageSize(newVal) {
            this.size = newVal;
        },
        page(val) {
            this.crtPage = val;
        },
        crtPage(val) {
            this.$emit('update:page', val);
        },
    },
    methods: {
        setPageSize(e) {
            this.size = e.value;
            this.crtPage = 1;
            this.$emit('select', {
                pageSize: e.value,
                page: this.crtPage,
            });
        },
        setPageNum(e) {
            this.crtPage = e.page;
            this.$emit('select', {
                pageSize: this.size,
                page: e.page,
            });
        },
    },
};
</script>

<style module>
    .clearfix {
        height: 100px;
    }
    .clearfix::after {
        content: ' ';
        clear: both;
    }
    .wrap{
        float: right;
        margin-top: 20px;
        margin-bottom: 50px;
    }
    .select{
        display: inline-block;
        width:60px !important;
    }
    .select > ul{
        width:60px !important;
    }
    .page{
        display: inline-block;
        vertical-align: middle;
    }
    .items {
        margin: 0 15px 0 6px;
    }
    .pages{
        margin: 0 15px 0 6px;
    }

</style>
