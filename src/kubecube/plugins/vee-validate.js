import Vue from 'vue';
import {
    ValidationObserver,
    ValidationProvider,
    extend, setInteractionMode,
} from 'vee-validate';

import { rules } from './validators';
// Register it globally
Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);

setInteractionMode('eager');

Object.keys(rules).forEach(rule => {
    extend(rule, rules[rule]);
});
