<template>
  <div
    gap="small"
    :class="$style.root"
  >
    <u-suggest
      v-model="model.key"
      style="width: 200px;height: 36px;"
      :data="keys"
    />
    <u-select
      v-model="model.operator"
      style="width: 100px;height: 36px;"
      :data="operators"
    />
    <u-suggest
      ref="suggest"
      v-model="model.value"
      :style="`min-width: 200px; width: ${suggestionslength}em;height: 36px;vertical-align: bottom;`"
      :data="suggestions"
      @select="submit"
    />
    <a
      target="_self"
      :class="$style.confirm"
      color="primary"
      @click="submit"
    >确定</a>
    <a
      target="_self"
      :class="$style.close"
      @click="cancel"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { get } from 'vuex-pathify';
import { OPERATOR_MAP, operators } from './filter-utils';
import logseerService from 'kubecube/services/logseer';
import { buildfilter } from './filter-utils';
import _ from 'lodash';
export default {
    data() {
        return {
            operators: operators.map(k => ({ text: OPERATOR_MAP[k], value: k })),
            keys: [],
            suggestions: [],
            model: this.getDefaultModel(),
            suggestionslength: 0,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        clusterName: get('scope/cluster@value'),
        ...mapState({
            task: state => state.lens.task,
            isNode: state => state.scope.containerType === 'node',
        }),
        valid() {
            return this.model.key && this.model.operator && this.model.value;
        },
    },
    watch: {
        'model.key': function(val) {
            if (val) {
                this.getSuggestions(val);
            } else {
                this.suggestions = [];
            }

        },
    },
    created() {
        this.getAvailableFields();
    },
    methods: {
        getSuggestions(val) {
            const task = this.task;
            const body = {
                field: val,
                filters: [
                    ...buildfilter(this.clusterName, this.namespace, this.isNode),
                ],
            };
            if (task && task !== 'all') {
                body.filters.push({
                    key: 'logconfig',
                    operator: 'is',
                    value: task,
                });
            }
            logseerService.suggestions({
                data: body,
            }).then(({ suggestions }) => {
                this.suggestions = suggestions.map(s => ({
                    text: s, value: s,
                }));
                const max = this.suggestions.reduce((accu, i) => {
                    if (i.text.length > accu) {
                        return i.text.length;
                    }
                    return accu;
                }, 0);
                this.suggestionslength = max * 0.618;
                console.log(this.suggestionslength);
            });
        },
        getAvailableFields() {
            logseerService.availableFields().then(result => {
                this.keys = result.availableFields.map(v => ({
                    text: v, value: v,
                }));
            });
        },
        getDefaultModel() {
            return {
                key: '',
                operator: 'is',
                value: '',
                disable: false,
            };
        },
        open(model) {
            Object.assign(this.model, (model && _.cloneDeep(model)) || this.getDefaultModel());
            this.$refs.suggest.currentText = this.model.value;
        },
        onKeyPress(e) {
            if (e.code === 'Enter') {
                if (this.valid) { this.submit(); } else { this.cancel(); }
            }
        },
        submit() {
            if (this.valid) {
                this.$emit('change', _.cloneDeep(this.model));
            } else {
                this.$emit('cancel');
            }
        },
        cancel() {
            this.$emit('cancel');
        },
    },
};
</script>

<style module>
.root{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 10px;
}
.root > * + *{
    margin-left: 10px;
}
.confirm{
    width: 68px;
    height: 36px;
    font-size: 14px;
    display: inline-block;
    line-height: 36px;
    background: $brand-primary;
    text-align: center;
    color: #fff;
    vertical-align: bottom;
}
.close{
    display: inline-block;
    vertical-align: bottom;
    border: 1px solid #DFE4EE;
}
.close::after{
    display: block;
    content: ' ';
    width: 34px;
    height: 34px;
    background: url(./assets/ic_cancel@2x.png) center center/40% 40% no-repeat;
}
</style>
