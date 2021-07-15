<template>
  <div>
    <validation-observer
      ref="observer"
      v-slot="{ errors }"
    >
      <ul
        v-show="showTabs"
        :class="$style.ul"
      >
        <li
          v-for="(t, index) in listLocal"
          :key="t.key"
          :class="$style.tab"
          :curTab="curTab === t.key"
          @click="choose(t)"
        >
          <span
            v-if="extractBasicErrors(errors, [getErrorKey(t.key)])"
            :class="$style.tabwarning"
          >!</span>
          {{ titleKey ? t.value[titleKey] : ` 配置${index+1}` }}
          <span
            v-if="disabled"
            :class="$style.occupation"
          />
          <span
            v-else
            :class="$style.tabDelete"
            @click.stop="remove(t.key)"
          />
          <slot
            :name="`${t.value[tabKey]}.tab`"
            :model="t.value"
          />
        </li>
        <li
          v-show="!disabled"
          :class="$style.tabplus"
          @click="add"
        />
      </ul>
      <div
        class="kubecube-tab"
        :active="activing"
      >
        <transition-group
          :name="transitionName"
          @before-enter="activing=true"
          @after-enter="activing=false"
        >
          <div
            v-for="t in listLocal"
            v-show="curTab === t.key"
            :key="t.key"
          >
            <slot
              :model="t.value"
              :state="curTab === t.key"
              :errorPrefix="getErrorKey(t.key)"
            />
            <slot
              :name="`${t.value[tabKey]}`"
              :model="t.value"
              :state="curTab === t.key"
              :errorPrefix="getErrorKey(t.key)"
            />
          </div>
        </transition-group>
      </div>
    </validation-observer>
  </div>
</template>

<script>
import { some, flatten, values } from 'lodash';
let uniqueKey = 0;
export default {
    model: {
        prop: 'list',
        event: 'listchange',
    },
    props: {
        disabled: Boolean,
        showTabs: {
            type: Boolean,
            default: true,
        },
        titleKey: String,
        tabKey: String,
        list: {
            type: Array,
            default: () => ([]),
        },
        dataTemplate: {
            type: Function,
            default: () => ({}),
        },
        initRequired: {
            type: Boolean,
            default: true,
        },
        errorPrefix: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            activing: false,
            curTab: uniqueKey,
            cache: {},
            unwatch: {},
            transitionName: 'kubecube-tab-x-transition',
        };
    },
    computed: {

        layout() {
            return this.layoutComp || 'div';
        },
        listLocal: {
            get() {
                return this.list.map(i => this.watchItem(i));
            },
            set(value) {
                this.$emit('listchange', value.map(v => v.value));
            },
        },
        currTarget() {
            return this.cache[this.curTab];
        },
    },
    watch: {
        curTab() {
            this.$emit('tabChange');
        },
    },
    created() {
        if (this.initRequired && this.listLocal.length === 0) {
            this.add();
        }
        // if (this.listLocal.length > 0) {
        //     console.log('created');
        //     this.listLocal = this.listLocal.map(i => this.watchItem(i));
        // }
    },
    methods: {
        getErrorKey(key) {
            return `${this.errorPrefix}tab-${key}`;
        },
        splitError(errors, properties) {
            const err = {};
            Object.keys(errors).forEach(key => {
                if (some(properties, p => key.startsWith(p))) {
                    err[key] = errors[key];
                }
            });
            return flatten(values(err)).filter(a => a.length > 0);
        },
        extractBasicErrors(errors, properties) {
            const shrinkarr = this.splitError(errors, properties);
            if (shrinkarr.length === 0) {
                return '';
            }
            // console.log($tj(shrinkarr[0]))
            return shrinkarr[0];
        },
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
            this.unwatch[key] = this.$watch(() => target,
                val => {
                    this.change(key, val);
                }, {
                    deep: true,
                });
            return target;
        },
        chooseNext() {
            const idx = this.listLocal.findIndex(q => q.key === this.curTab);
            this.transitionName = 'kubecube-tab-x-transition';
            this.curTab = this.listLocal[(idx + 1) % this.listLocal.length].key;
        },
        choose(item) {

            this.transitionName = this.curTab < item.key ? 'kubecube-tab-x-transition' : 'kubecube-tab-x-reverse-transition';
            this.curTab = item.key;
        },
        add() {
            const target = this.watchItem(this.dataTemplate());
            this.listLocal = this.listLocal.concat([ target ]);
            this.curTab = target.key;
        },
        remove(key) {
            const index = this.listLocal.findIndex(i => i.key === key);
            let list = this.listLocal.slice(0, index).concat(this.listLocal.slice(index + 1));
            this.unwatch[key]();
            this.$delete(this.cache, key);
            this.$delete(this.unwatch, key);
            if (this.initRequired && list.length === 0) {
                list = [ this.watchItem(this.dataTemplate()) ];
            }
            this.listLocal = list;
            const idx = Math.min(list.length - 1, index);
            this.curTab = list[idx].key;
        },
        change(key, value) {
            const index = this.listLocal.findIndex(i => i.key === key);
            const newVal = value;
            const list = this.listLocal.slice();
            list[index] = newVal;
            this.listLocal = list;
        },
    },
};
</script>

<style module>

.ul {
    border-bottom: 1px solid #e0e6ed;
    user-select: none;
    list-style: none;
    margin: 0;
    padding: 0;
}
.tab{
    cursor: pointer;
    position: relative;
    display: inline-block;
    margin: 0;
    -webkit-box-sizing: content-box;
    box-sizing: content-box;
    height: 30px;
    line-height: 30px;
    padding: 0 10px 0 28px;
    border: 1px solid transparent;
    border-bottom: none;
    margin-bottom: -1px;
    list-style: none;
}
.tab[curTab="true"]{
    background: #fff;
    color: #508ae2;
    border-color: #e0e6ed;
    border-top: 2px solid #508ae2;
}
.tabplus{
    margin: 0 10px;
    display: inline-block;
    width: 20px;
    height: 20px;
    background: $brand-primary;
    color: #fff;
    border-radius: 100%;
    cursor: pointer;
    line-height: 18px;
}
.occupation {
    display: inline-block;
    width: 20px;
    height: 20px;
}
.tabDelete{
    display: inline-block;
    width: 20px;
    height: 20px;
    color: #fff;
    border-radius: 100%;
    cursor: pointer;
    line-height: 18px;
    vertical-align: middle;
    color: $brand-disabled;
}
.tabwarning{
    position: absolute;
    display: inline-block;
    left: 8px;
    top: 6px;
    width: 16px;
    height: 16px;
    border-radius: 100%;
    color: #fff;
    background-color: $brand-error;
    text-align: center;
    line-height: 16px;
}
.tabDelete:hover{
    color: $brand-primary;
}
.tabDelete::after{
    content: ' ';
    display: block;
    text-align: center;
    width: 20px;
    height: 20px;
    icon-font: url(./close.icon.svg);
}
.tabplus::after{
    content: '+';
    display: block;
    text-align: center;
    color: #fff;
    width: 20px;
}
</style>
