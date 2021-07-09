<template>
    <div v-if="Object.keys(model).length">
        <div :class="$style.repoCard"
            @click="onSelectImage" :selected="selected">
            <u-linear-layout
                style="flex: 1;margin-right: 0px;"
                type="flex"
                alignment="center">
                <div :class="$style.logo"><i :class="'i-repoLogo50'"></i></div>
                <div>
                    <div :class="$style.info" >
                        <u-text style="width: 310px" wrap="ellipsis">{{ model.name }}</u-text>
                    </div>
                    <div :class="$style.tags" @click.stop>
                        <u-suggest size="small" style="width: 310px;line-height: 1.8em; height: auto;" empty-text="无匹配标签" v-model="tagName" :data="tagNames"></u-suggest>
                    </div>
                </div>
            </u-linear-layout>
            <div :class="$style.optionBox">
                <u-link>选择</u-link>
            </div>
        </div>
    </div>
    <div v-else>
        <div :class="[$style.repoPanel, $style.repoPanelEmpty]"></div>
    </div>
</template>
<style module>
.repoCard {
    display: flex;
    border: 1px solid #dfe4ec;
    margin-right:0;
    padding: 5px;
    cursor: pointer;
    flex-direction: horizontal;
    justify-content: space-between;
    align-item: center;
}
.repoPanel {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    min-width: 450px;
    height: 70px;
    padding: 9px;
    border: 1px solid #e1e8ed;
    cursor: pointer;
}


.repoPanel[static] {
    width: 500px;
}

.repoPanel:hover, .repoCard:hover  {box-shadow: 0 0 10px 0 rgba(80,90,109,0.16);}
.repoPanel[selected], .repoCard[selected] {border-color: #67aaf5;}

.repoPanelEmpty {
    padding-top: 20px;
    padding-bottom: 20px;
    line-height: 30px;
    text-align: center;
    color: #5494db;
    cursor: pointer;
    transition: border-color 0.2s;
}
.repoPanelEmpty:after {
    content: "\002b\0020\9009\62e9\955c\50cf";
}
.logo {
    line-height: 1px;
    margin-right: 10px;
    width: 50px;
}
.info {
    vertical-align: middle;
    width: 310px;
    line-height: 1em;
    margin-bottom: 4px;
    font-size: 12px;
}
/* .info:before {
    content: "";
    display: inline-block;
    vertical-align: middle;
    height: 50px;
} */
.infobox {
    display: inline-block;
    vertical-align: middle;
    width: calc(94%);
}
.name > span {
    display: inline-block;
    max-width: 190px;
    line-height: 20px;
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: middle;
    font-size: 14px;
    color: #333;
}
.name > i {
    margin-left: 3px;
    vertical-align: middle;
}
.desc {
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 20px;
    line-height: 20px;
    color: #999;
}
.tags {
    line-height: 1em;
    font-size: 12px;
    width: 310px;
    margin-right: 20px;
}
.optionBox {
    display: flex;
    align-items: center;
    width: 30px;
    margin: 0 10px 0 0;
}
.corner {
    position: absolute;
    top: -1px;
    left: -1px;
    font-size: 0;
}
.corner > i {
    font-size: 30px;
    color: #67aaf5;
}
</style>
<script>
import { Field } from 'cloud-ui.vusion';
import service from '@micro-app/common/services/ncs';

export default {
    name: 'u-repo-panel',
    mixins: [Field],
    props: {
        info: { type: Object, default: () => ({}) },
        selected: { type: Boolean, default: false },
        image: { type: String, default: '' },
        clusterId: [String, Number],
    },
    watch: {
        image(value) {
           this.model.image = value;
           this.tagName = this.getTagName(value, this.repoName);
        },
        tagName(value) {
            this.timeId && clearTimeout(this.timeId);
            this.timeId = setTimeout(() => this.loadRepoTags(), 500);
        },
    },
    data() {
        const { image, name: repoName, tags } = this.info;
        return {
            model: Object.assign({}, this.info),
            repoName,
            tagNames: tags.map((item) => ({ text: item, value: item })),
            tagName: this.getTagName(image, repoName),
            timeId: null,
        };
    },
    created() {

    },
    destroyed() {
        this.timeId && clearTimeout(this.timeId);
    },
    methods: {
        onSelectImage() {
            const image = this.model.image.split(this.repoName + ':')[0] + this.repoName + ':' + this.tagName;
            this.$emit('select', image);
        },
        getTagName(image, repoName) {
            return (image && repoName) ? image.split(repoName + ':')[1] : '';
        },
        loadRepoTags() {
            const { tagName, repoName, clusterId } = this;
            service.loadRepoTags({
                tagName,
                repoName,
                clusterId: clusterId || +localStorage.getItem('clusterId'),
                pageSize: 1000,
            }).then((result) => {
                this.tagNames = result.tags.map((item) => ({ text: item.name, value: item.name }));
            });
        },
    },
};
</script>
