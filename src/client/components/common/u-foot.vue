<template>
    <div :class="$style.root">
        <div :class="$style.footer" v-if="brandName === 'netease'">
            <p>网易公司版权所有 © 1997-{{ year }} | 增值电信业务经营许可证 B1.B2-20090185 | ICP备 粤B2-20090191</p>
        </div>
    </div>
</template>

<script>
import filter from '@micro-app/common/filters/filter';
export default {
    name: 'u-foot',
    data() {
        const year = filter.getYear(new Date().getTime());
        return {
            year,
            brandName: localStorage.getItem('brandName'),
        };
    },
};
</script>

<style module>
.root{
    width: 100%;
    min-width: 1200px;
    max-width: 1920px;
    margin: 0 auto;
}
.footer {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 70px 0 48px;
    font-size: 12px;
    text-align: center;
    color: #999;
}

.footer p {
    margin-top: 10px;
}
</style>
