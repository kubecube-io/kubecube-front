<template>
  <span :class="$style.root">
    <u-tooltip>
      <span @click="SET_SHOW_LIKES_POPPER(!showLikesPopper)">
        <u-icons
          name="global"
          :class="$style.logType"
          :mode="incharge || showLikesPopper"
        />
      </span>
      <div slot="content">
        感兴趣字段
      </div>
    </u-tooltip>
    <div
      v-show="showLikesPopper"
      slot="popper"
      :class="$style.drawer"
      :style="`height:${popperHeight}px`"
    >
      <u-linear-layout
        direction="horizontal"
        type="flex"
        alignment="center"
        style="margin-bottom: 10px;"
      >
        <span
          style="cursor: pointer;"
          @click="SET_SHOW_LIKES_POPPER(false)"
        >
          <u-icon
            name="angle-left"
            size="small"
          />
        </span>
        <u-text>感兴趣字段</u-text>
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
      </u-linear-layout>
      <div
        :class="$style.body"
        :style="`height:${popperHeight-85}px`"
      >
        <div
          v-if="selected.length > 0"
          :class="$style.block"
        >
          <u-linear-layout
            :class="$style.stickyHead"
            direction="horizontal"
            type="flex"
            justify="space-between"
            alignment="center"
          >
            <u-text>已选字段</u-text>
            <u-button
              :class="$style.btn"
              @click="clearSelected"
            >清空</u-button>
          </u-linear-layout>
          <div :class="$style.content">
            <span
              v-for="s in selectedFiltered"
              :key="s"
              :class="[$style.fields, $style.selected]"
              @click="removeSelected(s)"
            >{{ s }}</span>
            <!-- <u-checkbox v-for="s in selected" :key="s" :value="true" @change="removeSelected(s)">{{ s }}</u-checkbox> -->
          </div>
        </div>
        <div
          v-if="remains.length > 0"
          :class="$style.block"
        >
          <u-linear-layout
            :class="$style.stickyHead"
            direction="horizontal"
            type="flex"
            justify="space-between"
            alignment="center"
          >
            <u-text>可选字段</u-text>
            <!-- <u-button :class="$style.btn" @click="selectAll">全选</u-button>  -->
          </u-linear-layout>
          <div :class="$style.content">
            <span
              v-for="s in remainsFiltered"
              :key="s"
              :class="[$style.fields, $style.remains]"
              @click="addToSelected(s)"
            >{{ s }}</span>
            <!-- <u-checkbox v-for="s in remains" :key="s" :value="false" @change="addToSelected(s)">{{ s }}</u-checkbox> -->
          </div>
        </div>
      </div>
      <div>
        <u-button
          color="primary"
          size="normal"
          style="width:100%;"
          @click="confirm"
        >确认并展示</u-button>
      </div>
    </div>
  </span>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
export default {
    props: {
        popperHeight: Number,
        incharge: Boolean,
    },
    data() {
        return {
            visible: false,
            currentValue: '',
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
        },
    },
    methods: {
        ...mapActions('likesSuggestion', [
            'addToSelected',
            'removeSelected',
            'clearSelected',
            'selectAll',
        ]),
        ...mapMutations('likesSuggestion', [ 'SET_SHOW_LIKES_POPPER' ]),
        confirm() {
            this.SET_SHOW_LIKES_POPPER(false);
            this.$emit('confirmchange');
        },
    },
};
</script>

<style module>
.root{
    position: relative;
}
.btn{
    background: $brand-primary;
    color: #fff;
    padding: 0 4px;
    height: 2em;
    line-height: 2em;
    font-size: 12px;
}
.btn:hover{
    color: #ffffff;
}
.body{
    height: 200px;
    overflow: scroll;
}
.stickyHead{
    top: 0px;
    background-color: #fff;
    position: sticky;
    z-index: 1;
}
.drawer{
    left: 0;
    width: 360px;
    padding: 12px;;
    z-index: 9999999999;
    background: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,0.1);
    height: ;
}
.search[class]{
    position: absolute;
    left: 5px;
    color: #ccc;
}
.input{
    flex: 1;
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
.block + .block{
    border-top: 1px solid $brand-primary;
    margin-top: 10px;
    padding-top: 10px;
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
.fields::before{
    position: absolute;
    left: 0;
    line-height: 16px;
    font-size: 20px;
}
.remains::before{
    content: '☐';
}
.selected::before{
    content: '☑';
}
.content{
    display: flex;
    flex-direction: column;
}
</style>
