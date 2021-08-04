<template>
  <u-popper
    ref="popper"
    style="z-index: 999;"
    append-to="reference"
    trigger="click"
    @toggle="onToggle($event)"
  >
    <div
      :class="$style.block"
    >
      <div :class="$style.innerBlock">
        <template v-for="l in listLocal">
          <span
            :key="l.key"
            :class="[$style.label, $style.primary]"
            @click.stop
          >
            <span
              :class="$style.kv"
              :title="`${l.value.label}:${l.value.value}`"
            >{{ l.value.label }}: {{ l.value.value }}</span>
            <span
              :class="$style.clear"
              @click="remove(l.key)"
            />
          </span>
        </template>
        <template v-if="editting">
          <span
            :class="$style.label"
            @click.stop
          >
            <span v-if="temp">{{ temp.label }}: </span>
            <input
              v-if="!temp"
              ref="labelInput"
              v-model="currentInput"
              :class="$style.inputting"
              autofocus
            >
            <input
              v-if="temp"
              ref="valueInput"
              v-model="temp.value"
              :class="$style.inputting"
              autofocus
              @blur.stop="confirm"
              @keydown.stop.enter="confirm"
            >
            <span :class="$style.clear" />
          </span>
        </template>

        <!-- <span :class="$style.blockitem">

            </span>   -->
      </div>
      <span :class="$style.clearPart">
        <span
          :class="$style.blockClear"
          @click.stop="clearAll"
        />
      </span>
    </div>
    <div
      slot="popper"
      style="width: 100%"
    >
      <ul
        v-if="labelListFiltered.length>0"
        ref="listView"
        :class="$style.listview"
      >
        <li
          v-for="item in labelListFiltered"
          :key="item.value"
          :class="$style.listitem"
          :hovered="item.hovered"
          @click.stop="selectLable(item.value)"
        >
          {{ item.text }}
        </li>
      </ul>
      <div
        v-else
        :class="$style.listview"
      >
        <div :class="$style.listitem">
          无可选值
        </div>
      </div>
    </div>
  </u-popper>
</template>

<script>
import { xor, cloneDeep } from 'lodash';
let uniqueKey = 0;
export default {
    model: {
        event: 'listchange',
        prop: 'list',
    },
    props: {
        labelList: {
            type: Array,
            default: () => ([]),
        },
        list: {
            type: Array,
            default: () => ([]),
        },
    },
    data() {
        return {
            cache: {},
            currentInput: '',
            temp: null,
            editting: false,
        };
    },
    computed: {
        labelListFiltered() {
            const chosen = this.listLocal.map(l => l.value.label);
            return xor(chosen, this.labelList).map(l => ({ text: l, value: l }));
        },
        listLocal: {
            get() {
                return this.list.map(i => this.watchItem(i));
            },
            set(value) {
                this.$emit('listchange', value.map(v => v.value));
            },
        },
    },
    methods: {
        watchItem(target) {
            for (const key in this.cache) {
                const v = this.cache[key];
                if (v.value === target) return v;
            }
            const key = uniqueKey++;
            target = {
                key,
                value: target,
            };
            this.$set(this.cache, key, target);
            return target;
        },
        add(target) {
            this.listLocal = this.listLocal.concat([ this.watchItem(target) ]);
        },
        remove(key) {
            const index = this.listLocal.findIndex(i => i.key === key);
            const list = this.listLocal.slice(0, index).concat(this.listLocal.slice(index + 1));
            this.listLocal = list;
        },
        selectLable(label) {
            this.temp = this.dataTemplate(label);
            this.$refs.popper.toggle(false);
            this.$nextTick(() => {
                this.$refs.valueInput.focus();
            });
        },
        clearAll() {
            this.listLocal = [];
        },
        dataTemplate(label) {
            return {
                label,
                value: '',
            };
        },
        confirm() {
            if (this.temp && this.temp.value) {
                this.add(cloneDeep(this.temp));
            }
            this.temp = null;
            this.$refs.popper.toggle(false);
            this.currentInput = '';
            this.$nextTick(() => {
                this.editting = false;
            });
        },
        onToggle($event) {
            if ($event.open) {
                this.editting = true;
                this.$nextTick(() => {
                    this.$refs.labelInput.focus();
                });
            } else if (!this.temp) {
                this.editting = false;
            }
        },
    },
};
</script>

<style module>
.block{
    width: 100%;
    position: relative;
    display: flex;
    min-height: 40px;
    line-height: 38px;
    background: #fff;
    color: #555;
    border: 1px solid #dfe4ec;
    border-radius: 3px;
    padding-left: 5px;

}
.label{
    box-sizing: border-box;
    white-space: nowrap;
    display: inline-block;
    border: 1px dashed #eee;
    padding: 2px 4px;
    border-radius: 5px;
    line-height: 100%;
    max-width: 100%;
}
.label.primary{
    background: $brand-primary;
    color: #fff;
    border: 1px solid $brand-primary;
}
.kv{
    max-width: calc(100% - 18px);
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
}
.clear{
    display: inline-block;
    cursor: pointer;
    border: 1px solid #fff;
    box-sizing: border-box;
    border-radius: 100%;
    width: 18px;
    height: 18px;
    text-align: center;
    vertical-align: text-bottom;
    transform: translateX(3px);
}
.clear::after{
    content: 'x';
}
.clear:hover{
    background: #fff;
    color: $brand-primary;
}
.clearPart{
    width: 26px;
    text-align: center;
    vertical-align: middle;
}
.blockClear{
    position: relative;
    display: inline-block;
    width: 18px;
    height: 18px;
    cursor: pointer;
    background: #ddd;
    border-radius: 100%;
    color: #fff;
    text-align: center;
    line-height: 16px;
    align-self: center;
}
.blockClear::after{
    content: 'x';
}
.blockClear:hover{
    background: #d3d3d3;
}
.inputting:focus,
.inputting{
    border-color: transparent;
    padding: 0;
    outline: none;
    width: 100px;
}
.innerBlock{
    flex: 1;
    background: #fff;
    width: 100%;
    overflow: hidden;
    line-height: 36px;
}
.blockitem{
    white-space: nowrap;
    position: relative;
    display: inline-flex;
    vertical-align: middle;
    min-width: 1px;
    background: #f5f7fa;
    line-height: 1;
    outline: 0;
    padding: 0 10px;
    border-radius: 10px;
    max-width: 160px;
    color: #a39ba3;
    border: 1px solid #f5f7fa;
}
.listview {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 150px;
    user-select: none;
    box-sizing: border-box;
    background: white;
    color: #555;
    border-radius: 4px;
    border: 1px solid #d2d6de;
    list-style: none;
    margin: 0;
}
.listitem {
    padding: 0 14px;
    color: #777;
    cursor: pointer;
    position: relative;
}
.listitem[divider] {
    margin: 9px 0;
    padding: 0;
    height: 1px;
    background: #e5e5e5;
    overflow: hidden;
    cursor: default;
}
.listitem[disabled] {
    cursor: not-allowed;
    color: #999;
}
.listitem:hover, .listitem[hovered] {
    background: $hover-color;
    color: #444;
}
.listitem[role="z-sel"] {
    background: $brand-primary;
    color: white;
}
</style>
