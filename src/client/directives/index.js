export const preventRepeatClick = {
    bind(el, binding) {
        el.addEventListener('click', () => {
            if (!el.isDisabled) {
                el.isDisabled = true
                setTimeout(() => {
                    el.isDisabled = false
                }, binding.value || 2000)
            }
        })
    }
};
