
export const OPERATOR_MAP = {
    is: '=',
};
export const operators = [ 'is' ];

export function buildfilter(
    cluster, namespace, isNode
) {
    const filters = [];
    if (cluster) {
        filters.push({
            key: 'cluster_name',
            operator: 'is',
            value: cluster,
        });
    }
    if (!isNode && namespace) {
        filters.push({
            key: 'namespace',
            operator: 'is',
            value: namespace,
        });
    }
    return filters;
}
