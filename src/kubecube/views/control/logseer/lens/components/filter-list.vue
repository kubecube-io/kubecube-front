<template>
  <div :class="$style.filters">
    <u-text :class="[$style.cell, $style.col1]">
      筛选条件：
    </u-text>
    <div
      ref="spanRoot"
      :class="[$style.cell, $style.col2]"
    >
      <filter-popper
        v-for="(f, index) in displayList"
        :key="f.uid"
        :value="f"
        :hide-operator="hideOperator"
        @change="onChange(index, $event)"
        @delete="onDelete(index)"
      />
      <filter-popper
        v-if="!hideOperator"
        :empty="true"
        @create="onCreate"
      />
      <span
        v-if="list.length > 0 && !hideOperator"
        :class="$style.clear"
        @click.stop="onClear"
      />
    </div>
    <div :class="[$style.cell, $style.col3]">
      <span
        v-if="needSpand"
        @click="spandHandler"
      >
        <i
          v-if="spand"
          :class="$style.upIcon"
        />
        <i
          v-else
          :class="$style.downIcon"
        />
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import filterPopper from './filter-popper.vue';
import _ from 'lodash';
export default {
    components: {
        'filter-popper': filterPopper,
    },
    inject: [ 'forceToRefresh' ],
    data() {
        return {
            spand: true,
            needSpand: false,
            spandIndex: 0,
        };
    },
    computed: {
        ...mapState({
            list: state => _.cloneDeep(state.lens.filters),
        }),
        displayList() {
            return this.spand ? this.list : this.list.slice(0, this.spandIndex);
        },
        hideOperator() {
            return this.needSpand && !this.spand;
        },
    },
    watch: {
        'list.length': function() {
            this.$nextTick(() => {
                this.reflowPoppers();
            });
        },
    },
    mounted() {
        this.reflowPoppers();
    },
    methods: {
        onCreate(filter) {
            this.$store.commit('lens/addFilter', filter);
            this.forceToRefresh();
        },
        onChange(index, filter) {
            this.$store.commit('lens/changeFilter', {
                index, filter,
            });
            this.forceToRefresh();
        },
        onDelete(index) {
            this.$store.commit('lens/removeFilter', index);
            this.forceToRefresh();
        },
        onClear() {
            this.$store.commit('lens/removeAllFilter');
            this.forceToRefresh();
        },
        reflowPoppers() {
            const rootelm = this.$refs.spanRoot;
            const children = rootelm.children;
            const level = children[children.length - 1].getBoundingClientRect().y;
            let changeIndex = null;
            for (let i = children.length - 1; i >= 0; i--) {
                const elm = children[i];
                if (changeIndex === null && Math.abs(elm.getBoundingClientRect().y - level) > 10) {
                    changeIndex = i;
                }
                children[i].style.marginBottom = '0';
            }

            if (changeIndex) {
                this.needSpand = true;
                this.spandIndex = changeIndex + 1;
                for (let i = 0; i <= changeIndex; i++) {
                    children[i].style.marginBottom = '10px';
                }
            } else {
                this.needSpand = false;
                this.spandIndex = 0;
                this.spand = true;
            }
        },
        spandHandler() {
            this.spand = !this.spand;
            this.$nextTick(() => {
                this.reflowPoppers();
                this.$nextTick(() => {
                    this.$emit('reflow');
                });
            });
        },
    },
};
</script>

<style module>
.filters {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.row{
    display: table-row;
}
.col1{
    width: 70px;
}
.col2{
    flex: 1;
}
.col3{
    width: 1em;
}
.clear{
    cursor: pointer;
    display: inline-block;
     vertical-align: middle;
    font-size: 14px;
    width: 24px;
    height: 24px;
    border: none;
    background-color: transparent;
}
.clear::after {
    display: block;
    content: ' ';
    width: 24px;
    height: 24px;
    text-align: center;
    background: url(./assets/ic_删除@2x.png) center center/24px 24px no-repeat;
}
.clear:hover::after {
    background-image: url(./assets/ic_删除_hover@2x.png);
}
.upIcon::before {
    icon-font: url(@micro-app/common/assets/icons/svg/angle-up.svg);
}
.downIcon::before {
    icon-font: url(@micro-app/common/assets/icons/svg/angle-down.svg);
}
</style>
