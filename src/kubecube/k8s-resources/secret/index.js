import { zipObjectDeep, pick } from 'lodash';
import { encode, decode } from 'js-base64';
import {
    toPlainObject as toConfigPlainObject,
    toK8SObject as toConfigK8SObject,
    toPatchObject as toPatchConfigObject,
} from '../base/config';
import {
    toObjectArray,
    KVtoObject,
} from '../base/utils';
import { getFromModel } from '../base/utils';
import {
    SECRET_TYPES_ENUM,
} from 'kubecube/utils/constance';

function decodeDockerJSON(data) {
    const { auths } = JSON.parse(decode(data['.dockerconfigjson']));
    return Object.keys(auths).map(host => ({
        host,
        ...pick(auths[host], [
            'username',
            'password',
            'email',
        ]),
    }));
}

export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    const type = g('type', SECRET_TYPES_ENUM.Opaque);
    return {
        ...obj,
        type,
        data: toObjectArray(g('data') || {}, 'key', 'value').map(d => ({ ...d, value: decode(d.value) })),
        dockerData: type === SECRET_TYPES_ENUM.DockerConfigJson ? decodeDockerJSON(g('data') || {}) : [],
        dataSource: g('data') || {},
    };
}

export function toK8SObject(model) {
    const g = getFromModel(model);
    const obj = toConfigK8SObject(
        'v1',
        'Secret',
        model
    );
    const type = g('type');
    let data;
    if (type === SECRET_TYPES_ENUM.Opaque) {
        data = KVtoObject(g('data').map(d => ({ ...d, value: encode(d.value) })), 'key', 'value');
    }
    if (type === SECRET_TYPES_ENUM.IngressTLS) {
        data = g('dataSource');
    }
    if (type === SECRET_TYPES_ENUM.DockerConfigJson) {
        const temp = {
            auths: {},
        };
        g('dockerData').forEach(d => {
            const { host, username, password, email } = d;
            temp.auths[host] = { username, password, email, auth: encode(username + ':' + password) };
        });
        data = {
            '.dockerconfigjson': encode(JSON.stringify(temp)),
        };
    }

    return {
        ...obj,
        ...zipObjectDeep([
            'data',
            'type',
        ], [
            data,
            type,
        ]),
    };
}

export function patchK8SObject(model) {
    const obj = toPatchConfigObject(model);
    const newK8SSpecObject = toK8SObject(model);
    return {
        ...obj,
        ...pick(newK8SSpecObject, [ 'data' ]),
    };
}
