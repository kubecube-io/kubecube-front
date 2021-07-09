<template>
    <u-modal :visible.sync="modalVisible" :title="'欢迎使用 ' + modalData.title.toUpperCase()" size="huge" @close="startUse">
        <div slot="body" :class="$style.body">
            <div :class="$style.logo">
                <u-icons :name="modalData.icon || modalData.title" :class="$style.logo_icon"></u-icons>
            </div>
            <div :class="$style.content">
                <div :class="$style.title">{{ modalData.title.toUpperCase() }}</div>
                <u-text :class="$style.text">{{ modalData.bref }}</u-text>
                <div :class="$style.sub_title">产品亮点：</div>
                <u-text v-for="(item, index) in modalData.Highlights" :key="index" :class="$style.text" display="block">{{ `${index + 1}、${item}` }}</u-text>
            </div>
        </div>
        <div slot="foot" :class="$style.foot">
            <u-linear-layout>
                <u-button color="primary" @click="startTutorial">使用教程</u-button>
                <u-button @click="startUse">开始体验</u-button>
            </u-linear-layout>
        </div>
    </u-modal>
</template>

<script>
export default {
    name: 'u-tutorial-modal',
    props: {
        title: String,
        visible: Boolean,
        data: Object,
    },
    data() {
        return {
            modalVisible: this.visible,
            modalData: this.data,
        };
    },
    watch: {
        visible(newVal) {
            this.modalVisible = newVal;
        },
        data(newVal) {
            this.modalData = newVal;
        },
    },
    methods: {
        startUse() {
            this.modalVisible = false;
            this.$emit('close');
        },
        startTutorial() {
            this.modalVisible = false;
            this.$emit('tutorial');
        },
    },
};
</script>

<style module>
.foot[class]{
    text-align: center;
}
.body[class]{
    width: 600px;
}
.logo{
    position: relative;
    display: inline-block;
    vertical-align: top;
    margin-right: 20px;
    width: 60px;
    height: 60px;
    background: #528AE2;
    color: #fff;
    border-radius: 3px;
}
.logo_icon[class]{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    vertical-align: middle;
    text-align: center;
}
.content{
    display: inline-block;
    vertical-align: top;
    width: calc(100% - 80px);
}
.title{
    font-size: 18px;
    color: #575962;
}
.text{
    font-size: 12px;
    color: #6F767A;
}
.sub_title{
    margin: 10px 0 5px 0;
    font-size: 14px;
    color: #575962;
}
</style>
