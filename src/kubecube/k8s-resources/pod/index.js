import { get } from 'lodash';
// import {
//     toPlainObject as toBasePlainObject,
//     getFromModel,
// } from '../base';
// import {
//     toPlainObject as toMetadataPlainObject,
// } from '../metadata';

// import {
//     toPlainObject as toPodSpecPlainObject,
// } from './pod-spec';

// import {
//     toPlainObject as toContainerPlainObject,
// } from '../container';

// // import {
// //     toPlainObject as toStatusPlainObject,
// // } from './status';

// export const toPlainObject = model => {
//     const g = getFromModel(model);
//     const podSpec = toPodSpecPlainObject(g('spec'));
//     const containers = toContainerPlainObject(g('spec'), model);
//     console.log(containers);
//     const status = g('status');
//     const obj = {
//         ...toBasePlainObject(model),
//         metadata: toMetadataPlainObject(model),
//         spec: podSpec,
//         containers,
//         // containers: toContainerPlainObject(model),
//         status: {
//             ...status,
//             restartCount: (g('status.containerStatuses') || []).reduce((a, i) => a + i.restartCount, 0),
//             cpuUsage: containers.reduce((a, i) => a + get(i, 'resources.cpu', 0), 0),
//             memoryUsage: containers.reduce((a, i) => a + get(i, 'resources.memory', 0), 0),
//         },
//     };
//     console.log(obj);
//     return obj;
// };

import {
    toPlainObject as toWorkloadPlainObject,
} from '../base/workload';
import {
    getFromModel,
} from '../base/utils';
import {
    toPlainObject as toSpecPlainObject,
    // toK8SObject as toSpecK8SObject,
} from './pod-spec';

export function toPlainObject(model) {
    return toWorkloadPlainObject(model)({
        toSpecPlainObject(m) {
            return toSpecPlainObject(m.spec);
        },
        podTemplatePath: 'spec',
        containerPath: 'spec',
        toStatusPlainObject(m, containers) {
            const g = getFromModel(m);
            const status = g('status');
            return {
                ...status,
                restartCount: (g('status.containerStatuses') || []).reduce((a, i) => a + i.restartCount, 0),
                cpuUsage: containers.reduce((a, i) => a + get(i, 'resources.cpu', 0), 0),
                memoryUsage: containers.reduce((a, i) => a + get(i, 'resources.memory', 0), 0),
            };
        },
    });
}
