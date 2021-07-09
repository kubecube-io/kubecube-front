import { Link } from 'cloud-ui.vusion';

export default {
    name: 'u-number-card',
    extends: Link,
    props: {
        title: String,
        value: [String, Number],
        unit: String,
    },
    computed: {
        isInteger() {
            return Number.isInteger(parseFloat(this.value));
        },
    },
};
