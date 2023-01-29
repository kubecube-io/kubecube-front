import Vue from 'vue';
import('./index.scss');

const formatBinding = binding => {
    if (typeof binding.value === 'string') {
        return {
            content: binding.value,
            disabled: binding.value === '',
        };
    }
    return binding.value || {};

};

export default {
    name: 'tips',
    bind(el, binding) {
        el.setAttribute('ellipsis', '');

        const customerProps = formatBinding(binding);
        const value = customerProps.content || el.innerText;
        const PopperClassList = [ 'qz-directive-tips' ];
        if (customerProps.popperClass) {
            Array.prototype.push.apply(PopperClassList, customerProps.popperClass.split(' '));
        }
        const propsData = Object.assign({
            reference: el,
            content: value,
            trigger: 'hover',
            placement: 'top',
        }, customerProps, {
            popperClass: PopperClassList.join(' '),
        });
        const Tooltip = Vue.component('ElPopover');
        el.tips = new Tooltip({
            propsData,
        }).$mount();
    },
    update(el, binding) {
        if (el.tips) {
            const value = formatBinding(binding).content || el.innerText;
            el.dataset.tips = value;
            el.tips.content = value;
            el.tips.disabled = formatBinding(binding).disabled;
        }
    },
    unbind(el /* , binding */) {
        el.tips && el.tips.$destroy();
    },
};
