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
        type, // Secret 类型
        data: toObjectArray(g('data') || {}, 'key', 'value').map(d => ({ ...d, value: decode(d.value) })), // opaque类型 数据
        dockerData: type === SECRET_TYPES_ENUM.DockerConfigJson ? decodeDockerJSON(g('data') || {}) : [], // DockerConfigJson类型 数据
        dataSource: g('data') || { 'tls.crt': '', 'tls.key': '' }, // IngressTLS类型 数据
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
    if (type === SECRET_TYPES_ENUM.Opaque) { // opaque
        data = KVtoObject(g('data').map(d => ({ ...d, value: encode(d.value) })), 'key', 'value'); // key-value
    }
    if (type === SECRET_TYPES_ENUM.IngressTLS) { // IngressTLS
        data = g('dataSource'); // 包含证书及密钥
    }
    if (type === SECRET_TYPES_ENUM.DockerConfigJson) { // DockerConfigJson
        const temp = {
            auths: {},
        };
        g('dockerData').forEach(d => {
            const { host, username, password, email } = d;
            temp.auths[host] = { username, password, email, auth: encode(username + ':' + password) };
        });
        data = {
            '.dockerconfigjson': encode(JSON.stringify(temp)), // 包含镜像仓库、用户名、密码、邮件
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
