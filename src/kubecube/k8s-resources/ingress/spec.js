import { pickBy, isObjectLike, flatten, uniq, groupBy, zipObjectDeep, omit } from 'lodash';
import { getFromModel } from '../base/utils';

const DISAPTCH_KEY = 'nginx.ingress.kubernetes.io/load-balance';

const COOKIE_KEY = 'nginx.ingress.kubernetes.io/session-cookie-name';
const HASH_KEY = 'ingress.netease.com/session-cookie-hash';
const HASH_VALUE = 'md5';
const AFFINITY_KEY = 'ingress.netease.com/affinity';
const AFFINITY_VALUE = 'cookie';

const REWRITE_KEY = 'ingress.netease.com/rewrite-target';

export const toPlainObject = model => {
    const g = getFromModel(model);

    const tls = (g('spec.tls') || []);
    const port = tls.length ? 443 : 80;
    const singleTLS = {
        enable: tls.length === 1,
        secretName: g('spec.tls[0].secretName'),
    };

    const annotations = g('metadata.annotations', {});
    const rules = g('spec.rules') || [];
    const rulesConfig = rules.map(rule => {
        const gr = getFromModel(rule);
        const host = gr('host');
        const httpPath = (gr('http.paths') || []).map(item => {
            const gp = getFromModel(item);
            return {
                path: gp('path'),
                service: gp('backend.service.name'),
                port: gp('backend.service.port.number'),
            };
        });
        return {
            host,
            secretName: (tls.find(t => t.hosts.includes(host)) || {}).secretName,
            httpPath,
        };

    });

    const services = [];
    const pathInfos = flatten(rules.map(rule => {
        const gr = getFromModel(rule);
        const host = gr('host');
        const httpPath = gr('http.paths') || [];
        return httpPath.map(item => {
            const gp = getFromModel(item);
            services.push(gp('backend.service.name'));
            return {
                url: `${port === 443 ? 'https' : 'http'}://${host || '*'}${gp('path')}`,
                service: `${gp('backend.service.name')}:${gp('backend.service.port.number')}`,
            };
        });
    }));

    return {
        ...pickBy(g('spec'), v => !isObjectLike(v)),
        port,
        annotations: {
            dispatch: annotations[DISAPTCH_KEY] || 'round_robin',
            enableSession: !!annotations[COOKIE_KEY],
            cookieName: annotations[COOKIE_KEY],
            rewrite: annotations[REWRITE_KEY],
        },
        tls,
        singleTLS,
        rules: g('spec.rules'),
        rulesConfig,
        pathInfos,
        services: uniq(services),
    };
};

const effectKeys = [
    'rules',
    'tls',
];
export function toK8SObject(model, metadata) {
    const g = getFromModel(model);
    const rulesConfig = g('spec.rulesConfig');
    const singleTLS = g('spec.singleTLS');
    const port = g('spec.port');

    const rules = [];
    let tls = [];

    rulesConfig.forEach(({ host, httpPath, secretName }) => {
        const obj = { host, http: {} };
        if (!singleTLS.enable && port === 443) {
            tls.push({ secretName, host });
        }
        obj.http.paths = httpPath.map(({ path, service, port }) => ({
            path,
            pathType: 'ImplementationSpecific',
            backend: {
                service: {
                    name: service,
                    port: {
                        number: parseInt(port),
                    },
                },
            },
        }));

        rules.push(obj);
    });

    if (singleTLS.enable) {
        tls = [{
            hosts: rules.map(r => r.host),
            secretName: singleTLS.secretName,
        }];
    } else {
        const grouped = groupBy(tls, 'secretName');

        tls = Object.keys(grouped)
            .map(secretName => ({
                secretName,
                hosts: grouped[secretName].map(t => t.host),
            }));
    }

    Object.assign(metadata.annotations, {
        [DISAPTCH_KEY]: g('spec.annotations.dispatch'),
        'kubernetes.io/ingress.class': 'istio',
        [REWRITE_KEY]: g('spec.annotations.rewrite'),
    });

    if (g('spec.annotations.enableSession')) {
        Object.assign(metadata.annotations, {
            [AFFINITY_KEY]: AFFINITY_VALUE,
            [HASH_KEY]: HASH_VALUE,
            [COOKIE_KEY]: g('spec.annotations.cookieName'),
        });
    } else {
        metadata.annotations = omit(metadata.annotations, [ 'AFFINITY_KEY', 'HASH_KEY', 'COOKIE_KEY' ]);
    }

    return zipObjectDeep(effectKeys, [
        rules,
        tls,
    ]);
}

export function patchK8SObject(model, metadata) {
    const pureSourceSpec = model.puresource.spec;
    const newK8SSpecObject = toK8SObject(model, metadata);
    const remains = omit(pureSourceSpec, effectKeys);
    return Object.assign({}, remains, newK8SSpecObject);
}
