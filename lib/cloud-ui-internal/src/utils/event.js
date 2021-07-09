const event = {
    on(element, type, listener) {
        if (element.addEventListener)
            element.addEventListener(type, listener, false);
        else if (element.attachEvent)
            element.attachEvent('on' + type, listener);
        else
            element['on' + type] = listener;

        return () => event.off(element, type, listener);
    },
    off(element, type, listener) {
        if (element.removeEventListener)
            element.removeEventListener(type, listener, false);
        else if (element.detachEvent)
            element.detachEvent('on' + type, listener);
        else
            element['on' + type] = null;
    },
    once(el, type, listener) {
        const fn = function (...args) {
            listener.apply(this, args);
            event.off(el, type, fn);
        };
        event.on(el, type, fn);
    },
};

export default event;
