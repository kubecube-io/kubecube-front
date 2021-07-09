export const specCRD = {
    group: 'monitoring.coreos.com',
    version: 'v1alpha1',
    plural: 'alertmanagerconfigs',
};

export const rulespecCRD = {
    group: 'monitoring.coreos.com',
    version: 'v1',
    plural: 'prometheusrules',
};

export const critical = [
    { text: '轻微', value: 'info' },
    { text: '一般', value: 'warning' },
    { text: '紧急', value: 'critical' },
];
