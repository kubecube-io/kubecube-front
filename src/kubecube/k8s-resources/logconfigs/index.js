import { merge, pickBy, zipObjectDeep, groupBy, isUndefined, isObject, isEmpty, isString, flatten } from 'lodash';
import {
    toPlainObject as toConfigPlainObject,
    toK8SObject as toConfigK8SObject,
} from '../base/config';
import {
    toObjectArray,
    KVtoObject,
} from '../base/utils';
import { getFromModel } from '../base/utils';

export const getDefault = () => ({
    paths: [],
    enable: true,
    matchFields: [],
    fields: [],
    multiline: {
        pattern: '',
        negate: true,
        match: 'before',
    },
    containerName: '',
    maxBytes: 0,
    excludeFiles: [],
    ignore_older: '',
    retainMode: 'retainNum',
    cleanLogs: {
        retainNum: 0,
        retainDays: 0,
    },
});

function resolveInputs(inputs) {
    return inputs.map(config => {
        const g = getFromModel(config);
        const template = getDefault();
        const paths = (config.paths || []).map(p => ({
            path: decodeURIComponent(p),
        }));
        const excludeFiles = (config.excludeFiles || []).map(p => ({
            path: decodeURIComponent(p),
        }));
        const matchFieldsMapping = g('matchfields') || {};
        const matchFields = flatten(Object.keys(matchFieldsMapping).map(k => {
            const value = matchFieldsMapping[k];
            return value.map(v => ({
                label: k,
                key: v,
            }));
        }));
        const fields = toObjectArray(g('fields') || {}, 'key', 'value');
        const m = {
            paths,
            matchFields,
            fields,
            excludeFiles,
            containerName: g('containerName'),
            maxBytes: parseInt(g('max_bytes')) || '',
            multiline: g('multiline'),
            ignore_older: parseInt(g('ignore_older')) || '',
            cleanLogs: g('cleanlogs'),
            retainMode: g('cleanlogs') && Object.keys(g('cleanLogs'))[0],
        };

        return merge(template, m);
    });
}


export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    const type = g('spec.inputs[0].type.name', 'dockerStdout');
    const inputs = resolveInputs(g('spec.inputs') || []);
    return {
        ...obj,
        type,
        inputs,
    };
}

function refactInputs(inputs, type) {
    return inputs.map(input => {
        const g = getFromModel(input);
        const matchFields = groupBy(g('matchFields').filter(f => f.key), 'label');
        Object.keys(matchFields).forEach(f => {
            matchFields[f] = matchFields[f].map(d => d.key);
        });
        return pickBy(zipObjectDeep([
            'enable',
            'type.name',
            'containerName',
            'paths',
            'matchfields',
            'fields',
            'exclude_files',
            'max_bytes',
            'multiline',
            'ignore_older',
            'cleanlogs',
        ], [
            true,
            type,
            g('containerName'),
            g('paths').filter(p => p.path.trim()).map(p => p.path),
            matchFields,
            KVtoObject(g('fields'), 'key', 'value'),
            g('excludeFiles').filter(p => p.path.trim()).map(p => p.path),
            g('maxBytes') > 0 ? `${g('maxBytes')}` : undefined,
            g('multiline.pattern') ? g('multiline') : undefined,
            g('ignore_older') ? `${g('ignore_older')}h` : undefined,
            g('cleanLogs')[g('retainMode')] ? { [g('retainMode')]: g('cleanLogs')[g('retainMode')] } : undefined,
        ]), v => !isUndefined(v) && (isObject(v) ? !isEmpty(v) : isString(v) ? v !== '' : true));
    });
}

export function toK8SObject(model) {
    const g = getFromModel(model);
    const obj = toConfigK8SObject(
        'netease.com/v1',
        'Logconfig',
        model
    );
    const inputs = refactInputs(g('inputs'), g('type'));
    if (inputs.length === 0) {
        inputs.push({
            enable: true,
            type: {
                name: g('type'),
            },
        });
    }

    return {
        ...obj,
        spec: {
            inputs,
        },
    };

}

export function patchK8SObject(model) {
    const newK8SSpecObject = toK8SObject(model);
    newK8SSpecObject.metadata.resourceVersion = model.puresource.metadata.resourceVersion;
    return newK8SSpecObject;
}

