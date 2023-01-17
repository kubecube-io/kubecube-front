
import {
    toObjectArray,
    KVtoObject,
} from '../base/utils';
function resolveIgnore(val) {
    if (!val) {
        return {};
    }
    const result = /(\d+)([dh])/.exec(val);
    if (result) {
        const [ _, num, unit ] = result;
        return {
            num: +num,
            unit,
        };
    }
}
export const getDefault = () => ({
    name: '',
    labelSelector: [],
    inputs: [
        {
            name: '',
            type: 'dockerStdout',
            paths: [
                {
                    path: 'stdout',
                },
            ],
            containerName: '',
            matchFields: [
                { type: '', key: '' },
            ], // 元信息/注入Pod标记
            fields: [
                {
                    key: '',
                    value: '',
                },
            ], // 元信息/自定义标记
            multiline: {
                active: false,
                pattern: '',
            },
            ignoreOlder: {
                num: '0',
                unit: 'h',
            },
            excludeFiles: [
                {
                    path: '',
                },
            ],
            cleanLogs: {
                retainDays: 0,
            },
        },
    ],
});

export function toPlainObject(model) {
    if (model) {
        return {
            name: model.name,
            labelSelector: toObjectArray(model.labelSelector, 'key', 'value'),
            inputs: model.inputs.map(item => {
                return {
                    exist: true,
                    name: item.name,
                    type: (item.paths || []).length === 1 && item.paths[0] === 'stdout' ? 'dockerStdout' : 'k8sLogfile',
                    paths: (item.paths || []).map(path => {
                        return {
                            path,
                        };
                    }),
                    containerName: item.containerName,
                    matchFields: Object.keys(item.matchFields).reduce((pre, cur) => {
                        const res = item.matchFields[cur].map(val => {
                            return {
                                type: cur,
                                key: val,
                            };
                        });
                        pre.push(...res);
                        return pre;
                    }, []),
                    fields: toObjectArray(item.fields || {}, 'key', 'value'),
                    multiline: {
                        active: item.multiline.active || false,
                        pattern: item.multiline.pattern || '',
                    },
                    ignoreOlder: resolveIgnore(item.ignoreOlder),
                    excludeFiles: (item.excludeFiles || []).map(path => {
                        return {
                            path,
                        };
                    }),
                    cleanLogs: item.cleanLogs,
                };
            }),
            createTime: model.createTime,
            updateTime: model.updateTime,
        };
    }
    return getDefault();
}

export function toModifyObject(model) {
    return {
        name: model.name,
        namespace: model.namespace,
        cluster: model.cluster,
        labelSelector: KVtoObject(model.labelSelector, 'key', 'value'),
        inputs: model.inputs.map(item => {
            return {
                name: item.name,
                paths: item.paths.filter(item => item.path).map(item => item.path),
                containerName: item.containerName,
                matchFields: item.matchFields.filter(item => item.type).reduce((pre, cur) => {
                    if (!pre[cur.type]) {
                        pre[cur.type] = [];
                    }
                    pre[cur.type].push(cur.key);
                    return pre;
                }, {}),
                fields: item.fields.filter(item => item.key).reduce((pre, cur) => {
                    pre[cur.key] = cur.value;
                    return pre;
                }, {}),
                multiline: item.multiline,
                ignoreOlder: `${item.ignoreOlder.num}${item.ignoreOlder.unit}`,
                excludeFiles: item.excludeFiles.filter(item => item.path).map(item => item.path),
                cleanLogs: item.cleanLogs,
            };
        }),
    };
}
