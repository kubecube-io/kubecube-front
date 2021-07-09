<template>
    <span :class="$style.root" v-if="!hidden">
        <u-select-ex ref="selectRef" :value="value" @input="onInput" :disabled="disabled" :placeholder="placeholder" :suggest="suggest" :size="size" v-on="$listeners" :data="listData" :data-source="dataSource"><slot></slot></u-select-ex>
        <div :class="$style.refresh" v-if="refresh"><slot name="refresh">手动刷新</slot> <span @click="handleRefresh"><u-icon :class="$style.icon" :loading="loading" name="refresh"></u-icon></span></div>
    </span>
</template>

<script>
import { utils } from 'cloud-ui.vusion';
export default {
    name: 'u-base-list-select',
    props: {
        value: [String, Number],
        size: { type: String, default: 'normal medium' },
        all: [Boolean, String],
        first: Boolean,
        refresh: Boolean,
        placeholder: {
            type: String,
            default: '请选择',
        },
        suggest: Boolean,
        disabled: Boolean,
        hidden: Boolean,
    },
    data() {
        return {
            dataMap: {},
            listData: [],
            dataSource: null,

            loading: false,
        };
    },
    computed: {
        allText() {
            if (this.all && typeof this.all === 'string') {
                return this.all;
            }
            return '全部';
        },
    },
    created() {
        this.handleRefresh();
    },
    methods: {
        onInput(value) {
            this.$emit('input', value);
            this.$emit('update:value', value);
        },
        _getList(pattern = '') {
            const _listData = this.all ? [{ text: this.allText, value: '0', id: 0 }] : [];
            if (this.all && !this.value) {
                this.onInput('0');
            }

            return this.loadList(pattern).then(({ list, map }) => // 排序
                ({ list: list.sort((a, b) => { // 排序
                    try {
                        return a.text.localeCompare(b.text, 'zh-CN');
                    } catch (error) {
                        try {
                            return a.text.localeCompare(b.text);
                        } catch (e) {
                            return 0;
                        }
                    }
                }), map })
            ).then(({ list, map }) => {
                if (list && map) {
                    const listData = _listData.concat(list);
                    const dataMap = map;

                    listData.forEach((item, index) => {
                        item.value = String(item.value);
                        if (this.first && index === 0 && !this.value) {
                            this.onInput(String(item.value));
                        } else if (this.value && String(this.value) === String(item.value)) {
                            this.onInput(String(item.value));
                        }
                    });

                    return { list: listData, map: dataMap };
                } else {
                    throw Error('调用异常');
                }
            }).then(({ list, map }) => {
                this.dataMap = map;
                this.$set(this, 'listData', list);
                this.$emit('success', list, map);
            }).catch((err) => {
                this.$toast && this.$toast.show(err.Message || err.message || '获取失败!');
            });
        },
        handleRefresh() {
            this.loading = true;
            this.loadingTime = Date.now();

            const finallyCb = () => {
                const delay = Date.now() - this.loadingTime;
                if (delay > 1000) {
                    this.loading = false;
                } else {
                    setTimeout(() => {
                        this.loading = false;
                    }, 1000 - delay);
                }
            };

            if (this.suggest) {
                this.dataSource = new utils.DataSource({
                    fetch: ({ filter }) => {
                        const result = this._getList(filter.value).then(() => this.listData).finally(finallyCb);
                        return Promise.resolve(result);
                    },
                    hasMore: () => false,
                });
                this.$refs.selectRef && this.$refs.selectRef.fixFetchData();
            } else {
                this._getList().finally(finallyCb);
            }
        },
        loadList() {
            // 外部继承
            return Promise.resolve([]);
        },
    },
};
</script>

<style module>
.root {

}
.refresh {
    color: #999;
    font-size: 12px;
    padding: 0;
    line-height: 1.5;
}
.icon[class]:before {
    font-size: 12px;
    vertical-align: middle;
    padding: 0;
    margin: 0 6px;
    cursor: pointer;
}
.icon:hover:before {
    color: #508ae2;
}
.icon {
    display: inline-block;
    text-align: center;
}
.icon[loading] {
    color: #508ae2;
    animation: rotate .6s infinite linear;
}
@keyframes rotate
{
    0% { transform: rotate(0); opacity: 0.65; }
    50% { transform: rotate(180deg); opacity: 1; }
    100% { transform: rotate(359deg); opacity: 0.65; }
}
</style>
