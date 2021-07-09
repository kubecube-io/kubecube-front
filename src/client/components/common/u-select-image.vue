<template>
    <u-modal :class="$style.root" @close="close" :title="title" ok-button="" cancel-button="" :visible.sync="show" size="auto">
        <u-linear-layout justify="center" :class="$style.searchWrap">
            <u-input :class="$style.search" size="large" v-model="keyword" @input="search"></u-input>
        </u-linear-layout>
        <u-tabs v-model="type" :class="$style.listview">
            <u-tab v-for="(tab, index) in tabs" :key="index" :value="tab.value" :title="tab.text"></u-tab>
        </u-tabs>

        <div :class="$style.content">
            <u-linear-layout justify="center" v-if="loading" :class="$style.wrap">
                <u-loading size="large"></u-loading>
            </u-linear-layout>
            <u-linear-layout justify="center" v-else-if="loadFail" :class="$style.wrap">
                请求数据失败
            </u-linear-layout>
            <u-linear-layout justify="center" v-else-if="!currentList.length" :class="$style.wrap">
                暂无数据
            </u-linear-layout>
            <u-grid-layout v-else>
                <u-grid-layout-row>
                    <u-grid-layout-column :span="6" :class="$style.column" v-for="item in currentList" :key="item.id">
                        <u-repo-panel :info="item" :clusterId="clusterId" :selected="(item.images || []).includes(image)" :image="image" @select="onSelectImage"></u-repo-panel>
                    </u-grid-layout-column>
                </u-grid-layout-row>
                <u-linear-layout style="margin: 20px 10px 0 0;" justify="end" direction="vertical" v-if="totalPage>1">
                    <u-pagination :total="totalPage" :page="page" @select="changePage"></u-pagination>
                </u-linear-layout>
            </u-grid-layout>
        </div>
    </u-modal>
</template>

<style module>
@media screen and (max-width: 1100px) {
    .root > div {
        width: 800px !important;
    }
    .column {
        width: 100% !important;
    }
    .content {
        width: 100% !important;
    }
}
.searchWrap {
    margin-bottom: 20px;
}
.search[class] {
    text-align: left;
    padding-left: 40px !important;
}
.search:after {
    position: absolute;
    left: 10px;
    icon-font: url('@micro-app/common/icons/svg/search.svg');
}
.tab[class] {
    box-sizing: border-box;
    width: 33.3%;
}
.listview > ul > li[class] {
    box-sizing: border-box;
    margin-bottom: -2px;
    width: 33.3% !important;
    text-align: center;
}

.content {
    width: 960px;
    height: 480px;
    overflow-y: auto;
    overflow-x: hidden;
}

.wrap {
    width: 960px;
}

</style>

<script>
import { Modal } from '@micro-app/common/base/mixins';
import service from '@micro-app/common/services/ncs.js';

export default {
    name: 'u-select-image',
    mixins: [Modal],
    props: {
        title: { type: String, default: '查看更多' },
        image: { type: String, default: '' },
        projectName: String,
        tenantName: String,
        clusterId: [String, Number],
    },
    data() {
        return {
            type: 3, // 1、2、3 对应 private || public || all
            loading: false,
            loadFail: false,
            keyword: '',
            list: [],
            currentList: [], // 当前tab展示的列表
            time: null,
            tabs: [
                { value: 3, text: '所有镜像' },
                { value: 2, text: '私有镜像' },
                { value: 1, text: '公开镜像' },
            ],

            totalPage: 1,
            page: 1,
            pageSize: 10,
        };
    },
    computed: {

    },
    watch: {
        show(value) {
            if (!value)
                return;
            this.loadImages();
        },
        type(value) {
            // 重置
            this.page = 1;
            this.loadImages();
        },
    },
    destroyed() {
        this.time && clearTimeout(this.time);
    },
    methods: {
        changePage(event) {
            this.page = event.page;
            this.loadImages();
        },
        loadImages() {
            this.loadFail = false;
            this.loading = true;
            const { projectName, tenantName, type, page, pageSize } = this;
            const params = {
                projectName,
                tenantName,
                type,
                clusterId: this.clusterId || localStorage.getItem('clusterId'),
                page,
                pageSize,
            };

            this.keyword && (params.filterString = this.keyword);

            service.loadImages(params).then(({ list, harbor, total }) => {
                // 防止在某tab下，展示其他tab的内容。例：从 私有 -> 全部 -> 私有。会先后调用全部和私有的接口，全部一般情况后返回。
                if (type === this.type) {
                    this.currentList = this.list = list.map((item) => Object.assign(item, {
                        image: harbor + '/' + item.name + ':' + item.tags[0],
                        images: item.tags.map((tag) => harbor + '/' + item.name + ':' + tag),
                    }));
                    this.totalPage = Math.ceil(total / pageSize);
                    this.loading = false;
                }
            }).catch((err) => {
                this.loading = false;
                this.loadFail = true;
            });
        },
        search() {
            this.time && clearTimeout(this.time);
            this.time = setTimeout(() => {
                // 重置
                this.page = 1;
                this.loadImages();
            }, 1000);
        },
        onSelectImage(image) {
            this.$emit('update:image', image);
            this.$emit('change', image);
            this.close();
        },
    },
};
</script>
