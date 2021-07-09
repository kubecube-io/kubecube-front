import { DatePicker } from 'cloud-ui.vusion';
import i18n from './i18n';

export default {
    name: 'u-date-picker-monitor',
    mixins: [DatePicker],
    i18n,
    methods: {
        showSpecific(value) {
            value = new Date(value);
            const month = value.getMonth() + 1;
            const date = value.getDate();
            return month + this.$t('month') + date + this.$t('day');
        },
    },
};
