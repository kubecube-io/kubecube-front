<template>
    <div :class="$style.head" :size="headSize">
        <div :class="$style.logo" :size="headSize">
            <slot name="logo" v-if="$slots.logo"></slot>
            <template v-else>
                {{(title || '').substring(0, 2).toUpperCase()}}
            </template>
        </div>
        <div :class="$style.main" :size="headSize">
            <div :class="$style.tit">
                <slot name="title">
                    <h3 :title="title">{{title}}</h3>
                </slot>
            </div>
            <div :class="$style.info">
                <slot name="info">
                    <ul v-if="infos && infos.length">
                        <li v-for="(info, index) in infos" :key="index">
                            <label>{{info.label}}：</label>{{info.content}}
                        </li>
                    </ul>
                </slot>
            </div>
            <div :class="$style.act">
                <slot name="act">
                </slot>
            </div>
        </div>
    </div>
</template>

<style module>
.head {
    position: relative;
    margin-bottom: 20px;
    min-height: 90px;
}
.head[size='small']{
    position: relative;
    margin-bottom: 20px;
    min-height: 50px;
}
.logo{
    float: left;
    position: relative;
    width: 90px;
    height: 90px;
    background-color: $brand-primary;
    border-radius: 5px;
    overflow: hidden;
    line-height: 90px;
    text-align: center;
    font-size: 48px;
    color: #fff;
}
.logo[size='small']{
    width: 50px;
    height: 50px;
    font-size: 20px;
    line-height: 50px;
}
.logo span {
    position: absolute;
    left: 0;
    bottom: 6px;
    width: 100%;
    text-align: center;
    font-size: 10px;
    line-height: 15px;
}
.main{
    margin-left: 110px;
}
.main[size='small']{
    margin-left: 70px;
}
.tit{
    height: 24px;
    line-height: 24px;
    margin: 0px;
}
.tit > h3{
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
.info{
    height: 20px;
    margin: 3px 0 7px 0;
}
.info li, .info p{
    display: inline;
    margin: 0 6px 0 0;
    padding: 0 10px 0 0;
    line-height: 20px;
    font-size: 14px;
    color: #333;
}
.info li>label, .info p>label{
    color: #999;
}
</style>

<script>
export default {
    name: 'u-head-card',
    props: {
        title: {
            type: String,
            default: '-',
        },
        infos: {
            type: Array,
            default: () => {},
        },
        size: {
            type: String
        }
    },
    computed: {
        headSize() {
            if (this.$slots.logo) {
                return this.size;
            }
            return 'small';
        },
    },
};
</script>
