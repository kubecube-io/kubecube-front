function merge(op1, op2) {
    Object.assign(op1.option, op2.option);
    Object.assign(op1.listener, op2.listener);
    return op1;
}

/**
 *
 * @param {*} op  //  { type: 'create', text: '创建制品库', click() => {}, to: ... }
 */
function create(op) {
    const res = {
        option: { is: 'u-button', color: 'primary', icon: 'create', text: op.text, to: op.to },
        listener: {
            click: op.click,
        },
    };
    return merge(res, op);
}

/**
 *
 * @param {*} op    { type: 'fresh' }
 * @param {*} vm    u-block-list组件
 */
function refresh(op, vm) {
    const res = {
        option: { is: 'u-button', icon: 'refresh', square: true },
        listener: {
            click: () => {
                vm.refresh();
            },
        },
    };
    return merge(res, op);
}

/**
 *
 * @param {*} op    { type: 'search', search: () => {} }
 */
function search(op) {
    const res = {
        option: { is: 'u-input-search', 'align-right': true },
        listener: {
            search: op.search,
        },
    };
    return merge(res, op);
}

export default function normalizeOperation(op, vm) {
    if (op.type === 'create')
        return create(op);
    if (op.type === 'refresh')
        return refresh(op, vm);
    if (op.type === 'search')
        return search(op);

    return op;
}
