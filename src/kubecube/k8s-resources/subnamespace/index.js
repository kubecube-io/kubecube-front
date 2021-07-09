export function toK8SObject({
    namespace,
    tenant,
    project,
    scope,
}) {
    return {
        apiVersion: 'hnc.x-k8s.io/v1alpha2',
        kind: 'SubnamespaceAnchor',
        metadata: {
            labels: {
                'kubecube.io/project': project,
                'kubecube.io/tenant': tenant,
            },
            name: namespace,
            namespace: scope,
        },
    };
}
