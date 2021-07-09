import { zipObjectDeep } from 'lodash';
import { getFromModel, toObjectArray } from '../base/utils';
// import { unitConvert } from 'kubecube/utils/functional';

export const toPlainObject = model => {
    const g = getFromModel(model);
    return {
        storageClassName: g('spec.storageClassName'),
        storage: (g('spec.resources.requests.storage') || '0Gi').replace(/(K|M|G|T|P|E)i/g, ''),
        accessMode: g('spec.accessModes[0]', 'ReadWriteOnce'),
        matchLabels: toObjectArray(g('spec.selector.matchLabels', {}), 'key', 'value'),
        ...g('spec'),
    };
};


export function toK8SObject(model) {
    const g = getFromModel(model);

    return {
        ...zipObjectDeep([
            'storageClassName',
            'accessModes',
            'resources.requests.storage',
        ], [
            g('spec.storageClassName'),
            [ g('spec.accessMode') ],
            `${g('spec.storage')}Gi`,
        ]),
    };
}
