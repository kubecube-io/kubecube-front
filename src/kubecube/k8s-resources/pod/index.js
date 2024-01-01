import { get } from 'lodash';

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
            let cpuUsage = 0;
            let memoryUsage = 0;
            const tempContainers = containers.filter(item => item.type === 'normal')
            const tempInitContainers = containers.filter(item => item.type === 'init')
            tempContainers.forEach(i => {
                cpuUsage += get(i, 'resources.cpu', 0);
                memoryUsage += get(i, 'resources.memory', 0);
            });
            tempInitContainers.forEach(i => {
                const tempCpu = get(i, 'resources.cpu', 0);
                const tempmemory = get(i, 'resources.memory', 0);
                cpuUsage = tempCpu > cpuUsage ? tempCpu : cpuUsage;
                memoryUsage = tempmemory > memoryUsage ? tempmemory : memoryUsage;
            });
            return {
                ...status,
                restartCount: (g('status.containerStatuses') || []).reduce((a, i) => a + i.restartCount, 0),
                cpuUsage: Number(cpuUsage),
                memoryUsage: Number(memoryUsage),
                // cpuUsage: containers.reduce((a, i) => a + get(i, 'resources.cpu', 0), 0),
                // memoryUsage: containers.reduce((a, i) => a + get(i, 'resources.memory', 0), 0),
            };
        },
    });
}
