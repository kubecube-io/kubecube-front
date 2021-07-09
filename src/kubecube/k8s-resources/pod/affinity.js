export const operators = [ 'In', 'NotIn', 'Exists', 'DoesNotExist', 'Gt', 'Lt' ];

export const getDefaultAffinity = (type, namespace) => {
    if (type === 'nodeAffinity') {
        return {
            rules: [],
        };
    }
    return {
        rules: [],
        namespace,
        topologyKey: 'kubernetes.io/hostname',
    };
};

export const getDefaultAffinityRule = () => ({
    key: '',
    operator: operators[0],
    value: '',
});

export const resolveLableSelector = labelSelector => labelSelector.map(r => ({
    ...r,
    value: (r.values || []).join(' '),
}));

export const refactLableSelector = labelSelector => {
    const r = [];
    labelSelector.forEach(field => {
        if (field.key.trim() && [ 'Exists', 'DoesNotExist' ].includes(field.operator)) {
            r.push({
                key: field.key.trim(),
                operator: field.operator,
                values: [],
            });
        } else if (field.key.trim() && field.value.trim()) {
            r.push({
                key: field.key.trim(),
                operator: field.operator,
                values: field.value.trim().split(/\s/),
            });
        }
    });
    return r;
};
