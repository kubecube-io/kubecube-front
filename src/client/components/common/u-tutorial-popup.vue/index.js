export default {
    name: 'u-tutorial-popup',
    props: {
        currentStep: {
            type: Object,
        },
        subList: {
            type: Array,
        },
        selectList: {
            type: Array,
        },
        list: {
            type: Array,
        },
    },
    data() {
        return {
            stepList: this.list,
            currentSub: this.subList,
            mainStepList: this.selectList,
            step: this.currentStep,
        };
    },
    watch: {
        list: {
            handler(newVal) {
                this.stepList = newVal;
            },
            deep: true,
        },
        subList: {
            handler(newVal) {
                this.currentSub = newVal;
            },
            deep: true,
        },
        selectList: {
            handler(newVal) {
                this.mainStepList = newVal;
            },
            deep: true,
        },
        currentStep: {
            handler(newVal) {
                this.step = newVal;
            },
            deep: true,
        }
    },
    methods: {
        setNext() {
            if (this.step.value > this.stepList.length - 1)
                this.$router.push('/');
            else
                this.$emit('stepPlus');
        }
    },
}
