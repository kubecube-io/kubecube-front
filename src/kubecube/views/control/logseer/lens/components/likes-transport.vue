<template>
  <!-- <span :class="$style.root"> -->
  <!--
        <span @click="SET_SHOW_LIKES_POPPER(!showLikesPopper)" :class="$style.logType" :mode="incharge || showLikesPopper">
            <u-icons name="global"></u-icons>
            <u-text>感兴趣字段</u-text>
        </span> -->
  <!-- <div :class="$style.drawer" :style="`height:${popperHeight}px`" v-show="showLikesPopper" slot="popper"> -->
  <u-popper
    trigger="click"
    :open.sync="visible"
    append-to="reference"
  >
    <span>
      <u-icons name="logseerlikes" />
      <u-text>感兴趣字段</u-text>
    </span>
    <div
      v-show="showLikesPopper"
      slot="popper"
      :class="$style.drawer"
      :placement="top ? 'top-end' : 'bottom-end'"
      @click.stop
    >
      <u-linear-layout
        direction="horizontal"
        type="flex"
        alignment="center"
        justify="space-between"
        style="margin-bottom: 10px;"
      >
        <!-- <span @click="SET_SHOW_LIKES_POPPER(false)" style="cursor: pointer;">
                    <u-icon name="angle-left" size="small"></u-icon>
                </span> -->
        <u-text size="large">
          添加感兴趣的字段
        </u-text>
        <span
          :class="$style.close"
          @click="SET_SHOW_LIKES_POPPER(false)"
        />
        <!-- <u-input size="small normal" v-model="currentValue" placeholder="输入字段名称模糊搜索" :class="$style.input" @keyup.enter="search" @reset="search($event, '')" close>
                    <u-icons :class="$style.search" name="search"></u-icons>
                </u-input> -->
      </u-linear-layout>
      <!-- <div :class="$style.body" :style="`height:${popperHeight-85}px`"> -->
      <div :class="$style.body">
        <div :class="$style.part">
          <div>
            <u-text>可选择的字段</u-text>
          </div>
          <div :class="$style.box">
            <div :class="$style.boxHeader">
              <u-input
                v-model="currentValue"
                size="small normal"
                placeholder="输入字段名称模糊搜索"
                :class="$style.input"
                close
                @keyup.enter="search"
                @reset="search($event, '')"
              >
                <u-icons
                  :class="$style.search"
                  name="search"
                />
              </u-input>
            </div>
            <div :class="$style.block">
              <ul>
                <li
                  v-for="s in remainsToShow"
                  :key="s"
                  :mode="remainsLocal[s]"
                  :disabled="!remainsLocal[s] && selectedAndRemainLocalLength === 6"
                  :class="[$style.fields, $style.remains]"
                  @click.stop="toggleLocalRemains(s)"
                >
                  <u-tooltip
                    content="只能选择6个字段"
                    :disabled="remainsLocal[s] || selectedAndRemainLocalLength < 6"
                  >
                    <u-text display="block">
                      {{ s }}
                    </u-text>
                  </u-tooltip>

                  <!-- <span :class="$style.tip" v-if="!remainsLocal[s] && selectedAndRemainLocalLength === 6">只能选择6个字段</span> -->
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div :class="$style.middle">
          <span
            :class="$style.button"
            role="reverse"
            :disabled="!selectedLocalList.length"
            @click.stop="reverse"
          />
          <span
            :class="$style.button"
            role="forward"
            :disabled="!remainsLocalList.length"
            @click.stop="forward"
          />
        </div>
        <div :class="$style.part">
          <div>
            <u-text>已选择的字段</u-text>
          </div>
          <div :class="$style.box">
            <div :class="$style.boxHeader">
              <u-button
                :disabled="selectedFiltered.length === 0"
                size="small"
                color="primary"
                @click="clear"
              >
                清空
              </u-button>
              <u-text style="float: right">
                {{ selectedFiltered.length }}/6
              </u-text>
            </div>
            <div :class="$style.block">
              <ul>
                <li
                  v-for="s in selected"
                  :key="s"
                  :mode="selectedLocal[s]"
                  :class="[$style.fields, $style.selected]"
                  @click.stop="toggleLocalSelected(s)"
                >
                  {{ s }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </u-popper>
  <!-- </span> -->
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import _ from 'lodash';
function getContainerEl(el) {
    let node = el.parentNode;
    while (
        node &&
        node.tagName !== 'HTML' &&
        node.tagName !== 'BODY' &&
        node.nodeType === 1
    ) {
        if (node.hasAttribute('infinite-scroll-container')) {
            return node;
        }
        node = node.parentNode;
    }
    return node;
}
export default {
    props: {
        popperHeight: Number,
    },
    data() {
        return {
            visible: false,
            currentValue: '',
            remainsLocal: {},
            selectedLocal: {},
            top: false,
            calcTopThrottle: _.throttle(this.calcTop, 100),
            containeElm: null,
        };
    },
    computed: {
        ...mapState({
            suggestions: state => state.likesSuggestion.suggestions,
            selected: state => state.likesSuggestion.selected,
            remains: state => state.likesSuggestion.remains,
            loading: state => state.likesSuggestion.loading,
            showLikesPopper: state => state.likesSuggestion.showLikesPopper,
        }),
        remainsToShow() {
            return this.remains.filter(r => r.includes(this.currentValue));
        },
        selectedAndRemainLocalLength() {
            return this.selected.length + this.remainsLocalList.length;
        },
        remainsLocalList() {
            return Object.keys(this.remainsLocal).filter(k => this.remainsLocal[k]).map(k => k);
        },
        selectedLocalList() {
            return Object.keys(this.selectedLocal).filter(k => this.selectedLocal[k]).map(k => k);
        },
        selectedFiltered() {
            const currentValue = this.currentValue;
            if (currentValue) { return this.selected.filter(s => s.includes(currentValue)); }
            return this.selected;
        },
        remainsFiltered() {
            const currentValue = this.currentValue;
            if (currentValue) { return this.remains.filter(s => s.includes(currentValue)); }
            return this.remains;
        },
    },
    watch: {
        showLikesPopper(val) {
            this.visible = val;
            this.$nextTick(this.calcTopThrottle);
        },
        selectedAndRemainLocalLength(val) {
            console.log(val);
        },
        remains() {
            this.syncStates();
        },
        selected() {
            this.syncStates();
        },
        visible(val) {
            this.SET_SHOW_LIKES_POPPER(val);
        },
    },
    mounted() {
        this.syncStates();
        const container = getContainerEl(this.$el);
        this.containeElm = container;
        this.containeElm.addEventListener('scroll', this.calcTopThrottle);
    },
    destroyed() {
        this.containeElm.removeEventListener('scroll', this.calcTopThrottle);
    },
    methods: {
        ...mapActions('likesSuggestion', [
            'addToSelected',
            'removeSelected',
            'clearSelected',
            'selectAll',
            'addToSelectedList',
            'removeListSelected',
        ]),
        ...mapMutations('likesSuggestion', [ 'SET_SHOW_LIKES_POPPER' ]),
        confirm() {
            // this.SET_SHOW_LIKES_POPPER(false);
            this.$emit('confirmchange');
        },
        calcTop() {
            const { y } = this.$parent.$el.getBoundingClientRect();
            const { height } = this.$el.getBoundingClientRect();
            if (y + height < window.innerHeight - 30) this.top = false;
            else this.top = true;
        },
        clear() {
            this.clearSelected();
            this.confirm();
        },
        syncStates() {
            this.remainsLocal = {};
            this.selectedLocal = {};
            this.remains.forEach(s => {
                this.$set(this.remainsLocal, s, false);
            });
            this.selected.forEach(s => {
                this.$set(this.selectedLocal, s, false);
            });
        },
        reverse() {
            this.removeListSelected(this.selectedLocalList);
            this.confirm();
        },
        forward() {
            this.addToSelectedList(this.remainsLocalList);
            this.confirm();
        },
        toggleLocalRemains(s) {
            if (!this.remainsLocal[s] && this.selectedAndRemainLocalLength === 6) return;
            if (this.remainsLocal[s]) this.$set(this.remainsLocal, s, false);
            else this.$set(this.remainsLocal, s, true);
        },
        toggleLocalSelected(s) {
            if (this.selectedLocal[s]) this.$set(this.selectedLocal, s, false);
            else this.$set(this.selectedLocal, s, true);
        },
    },
};
</script>

<style module>
.root{
    position: relative;
}
/* .btn{
    background: $brand-primary;
    color: #fff;
    padding: 0 4px;
    height: 2em;
    line-height: 2em;
    font-size: 12px;
}
.btn:hover{
    color: #ffffff;
} */
.drawer{
    /* top: 50%; */
    color: #575962;
    width: 500px;
    height: 280px;
    padding: 12px;;
    z-index: 99;
    background: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,0.1);
}
/* .drawer[top='true']{
    transform: translateY(-311px);
} */
.body{
    display: flex;
    flex-direction: row;
}
.part{
    flex: 1;
}
.middle{
    width: 62px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.box{
    border: 1px solid #dfe4ec;
    padding: 0 8px;
}
.box .boxHeader{
    display: block;
    height: 3em;
    line-height: 3em;
    border-bottom: 1px solid #dfe4ec;
}
.box .block{
    flex: 1;
    overflow: scroll;
    height: 160px;
    max-width: 198px;
}

.search[class]{
    position: absolute;
    left: 5px;
    color: #ccc;
}
.input{
    width: 100%!important;
}
.input[class]{
    padding-left: 30px !important;
}
.logType[mode="true"]{
    color: #575962;
}
.logType{
    color: #eee;
    cursor: pointer;
}

.button {
    display: block;
    text-align: center;
    width: $height-base;
    height: $height-base;
    line-height: calc($height-base - $border-width-base * 2);
    background: $brand-primary;
    color: #fff;
    border: $border-width-base solid $border-color-base;
    border-radius: 100%;
}

.button:not(:last-child) {
    margin-bottom: 10px;
}

.button:hover {
    /* Required for `a` elements */
    text-decoration: none;
    /* color: $brand-primary; */
    border-color: $brand-primary;
}

.button:focus {
    /* Remove default focus style */
    outline: $focus-outline;
    /* Required for `a` elements */
    text-decoration: none;
}

.button:active {
    background: $background-color-base;
}

.button[disabled] {
    /* @Private */
    cursor: $cursor-not-allowed;

    /* @Public */
    background: white;
    border-color: $brand-disabled;
    color: $brand-disabled;
}
.button[role="reverse"]::before {
    content: '❮';
}

.button[role="forward"]::after {
    content: '❯';
}
.fields{
    padding-left: 20px;
    position: relative;
    cursor: pointer;
    line-height: 1.4em;
}
.fields:hover{
    background-color: rgb(255, 244, 239);
    border-right-color:rgb(255, 222, 139)
}
.fields[mode="true"]{
    background-color: $brand-primary;
    color: #fff;
}
.fields[disabled]{
    cursor: $cursor-not-allowed;
    color: $brand-disabled;
}
.close{
    display: inline-block;
    vertical-align: bottom;
    cursor: pointer;
}
.close::after{
    display: block;
    content: ' ';
    width: 24px;
    height: 24px;
    background: url(./assets/ic_cancel@2x.png) center center/40% 40% no-repeat;
}
/* .fields::before{
    position: absolute;
    left: 0;
    line-height: 16px;
    font-size: 20px;
} */
/* .remains::before{
    content: '☐';
}
.selected::before{
    content: '☑';
}
.content{
    display: flex;
    flex-direction: column;
} */
</style>
