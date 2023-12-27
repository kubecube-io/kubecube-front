import { flatten } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';

export function podService({
    workload,
    uid,
    cluster,
    namespace,
}) {
    if (workload === 'deployments') {
        return async () => {
            const response = await workloadExtendService.getWorkloads({
                pathParams: {
                    cluster,
                    namespace,
                    resource: 'replicasets',
                },
                params: {
                    pageSize: 10000,
                    selector: `metadata.ownerReferences.uid=${uid}`,
                },
            });
            const r2 = await Promise.all((response.items || []).map(i =>
                workloadExtendService.getWorkloads({
                    pathParams: {
                        cluster,
                        namespace,
                        resource: 'pods',
                    },
                    params: {
                        pageSize: 10000,
                        selector: `metadata.ownerReferences.uid=${i.metadata.uid}`,
                    },
                })
            ));
            return {
                items: flatten(r2.map(p => (p.items || []))),
            };

        };
    }
    return async () => {
        return await workloadExtendService.getWorkloads({
            pathParams: {
                cluster,
                namespace,
                resource: 'pods',
            },
            params: {
                pageSize: 10000,
                selector: `metadata.ownerReferences.uid=${uid}`,
            },
        });
    };
}
