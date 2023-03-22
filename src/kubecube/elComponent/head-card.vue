<template>
    <div :class="$style.root">
        <div :class="$style.header_logo">
            <slot name="logo">{{ (title || '').substring(0, 2).toUpperCase() }}</slot>
        </div>
        <div :class="$style.head_card_main">
            <div :class="$style.head_card_title">
                <h3>{{title}}</h3>
            </div>
            <div :class="$style.head_card_info">
                <div v-for="(info, index) in infos" :class="$style.infoItem" :key="index">
                    <div :class="$style.infoItemLabel">
                        {{info.label}}:
                    </div>
                    <div :class="$style.infoItemContent">
                         {{info.content}}
                    </div>
                </div>
            </div>
            <div>
                <slot name="act"></slot>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        title: {
            type: String,
            default: ''
        },
        infos: {
            type: Array,
            default: () => []
        }
    }
}
</script>
<style module>
.root {
    position: relative;
    margin-bottom: 12px;
    min-height: 90px;
}
.header_logo {
    float: left;
    position: relative;
    width: 90px;
    height: 90px;
    background-color: #3377ff;
    border-radius: 5px;
    overflow: hidden;
    line-height: 90px;
    text-align: center;
    font-size: 48px;
    color: #fff;
}
.head_card_main {
    margin-left: 102px;
    height: 90px;
}
.head_card_title {
    height: 24px;
    line-height: 24px;
    margin: 0px;
}

.head_card_title > h3 {
    position: relative;
    margin: 0px;
    margin-right: 10px;
    display: inline-block;
    vertical-align: top;
    max-width: 400px;
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 18px;
    color: #333;
}
.head_card_info {
    height: 20px;
    margin: 7px 0 7px 0;
    display: flex;
}
.infoItem {
    display: flex;
}
.infoItemLabel {
    color: #999;
    padding-right: 4px;
}
.infoItemContent {
    
}
</style>