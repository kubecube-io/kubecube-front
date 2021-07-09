<template>
    <div :class="$style.tableBlock" :size="size">
        <table :class="$style.addTable">
            <slot></slot>
        </table>
        <p v-if="dynamic">
            <u-form-table-add-button :disabled="disabled" @click="addNewTr()">添加{{ description }}</u-form-table-add-button>
        </p>
    </div>
</template>

<style module>
.tableBlock {
    margin-top: -10px;
}
.tableBlock[size="small"] {
    width: 460px;
}
.tableBlock[size="normal"]{
    width: 580px;
}
.tableBlock[size="medium"]{
    width: 780px;
}
.tableBlock[size="full"]{
    width: 100%;
}
.tableBlock[layout="auto"] table{
    table-layout: auto;
}
.addTable{
    table-layout: fixed;
    width: 100%;
    margin-bottom: 20px;
}
.addTable thead{
    color: #666;
    line-height: 40px;
    border-bottom: 1px solid #e1e8ed;
}
.addTable thead th{
    position: relative;
    font-weight: normal;
    text-align: left;
    height: 48px;
    font-size: 14px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    padding: 0 5px
}
.addTable tbody td{
    padding-top: 20px;
    padding-right: 10px;
}

.addTable tbody td:last-child{
    padding-right: 0px;
}
</style>

<script>
export default {
    name: 'u-form-table',
    props: {
        dynamic: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        description: { type: String },
        size: { type: String, default: 'normal' },

    },
    data() {
        return {
            trList: [],
            state: '',
            timeId: '',
        };
    },
    computed: {
        states() {
            return this.trList.filter((tr) => !tr.ignore).map((tr) => tr.state);
        },
    },
    created() {
        this.$on('add-item-tr', (tr) => {
            tr.table = this;
            this.trList.push(tr);
        });
        this.$on('remove-item-tr', (tr) => {
            const index = this.trList.indexOf(tr);
            tr.table = undefined;
            this.trList.splice(index, 1);
            this.$emit('validate', { valid: this.states.every((state) => state === 'success') });
        });
        this.$on('validate-item-tr', () => {
            this.state = this.getState();
            this.$emit('validate', {
                valid: this.state === 'success',
            });
        });
        this.$on('change-item-tr', _.debounce(() => {
            this.$emit('change', this.states);
        }, 200));
    },
    methods: {
        validate(silent = false) {
            return Promise.all(this.trList.map((tr) => tr.validate('submit', silent)
                .catch((errors) => errors)
            )).then((results) => {
                if (results.some((result) => !!result))
                    throw new Error(results);
            });
        },
        addNewTr() {
            this.$emit('add');
        },
        getState() {
            const STATE_LEVEL = {
                '': 4,
                focus: 3,
                validating: 2,
                error: 1,
                success: 0,
            };

            let state = 'success';
            this.trList.forEach((tr) => {
                if (tr.currentRules && STATE_LEVEL[tr.state] > STATE_LEVEL[state])
                    state = tr.state;
            });

            return state;
        },
    },
};
</script>
