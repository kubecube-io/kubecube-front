import { get, map, uniq } from 'lodash';
import monitorService from 'kubecube/services/monitor';
import { niceBytes, BPSunits, niceTiming, memoryUnits } from 'kubecube/utils/functional';
const NumberFormatter = new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    compactDisplay: 'short',
});

const NUMBER = /^\s*(-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?|NAN)\s*$/i;

export const resolveTemplate = template => {
    const r = template.split(/\[\[([^\]]*)]\]|\$([a-zA-Z0-9_]+)/);
    // console.log(template, r);
    return obj => {
        if (r.length === 1) return template;

        return r.reduce((str, part) => {
            if (obj.hasOwnProperty(part)) str += obj[part];
            else str += part || '';
            return str;
        }, '');
    };
};

export function resolveLegend(template = '') {
    const r = template.split(/\{\{([^}]*)\}\}/);
    return obj => {
        // console.log(obj, r, template);
        if (r.length === 1) return template;

        return r.reduce((str, part) => {
            if (obj[part]) str += obj[part];
            else str += part;
            return str;
        }, '');
    };
}


function labelValuesQueryResolver(label, metric) {
    if (!metric) {
        return async (params, otherParams = {}) => {
            const result = await monitorService.getVariableLabel({
                pathParams: {
                    label,
                },
                params: otherParams,
            });
            return map(get(result, 'data.data'), value => ({
                text: value,
                value,
            }));
        };
    }
    return async (params, otherParams = {}) => {
        const queryFunc = resolveTemplate(metric);
        const result = await monitorService.getVariableSeries({
            params: {
                'match[]': queryFunc(params),
                ...otherParams,
            },
        });
        const labels = map(get(result, 'data'),
            metric => metric[label] || '').filter(label => label !== '');
        return uniq(labels).map(metric => ({
            text: metric,
            value: metric,
        }));
    };
}

export function resolveVariablesRequest(request) {
    const labelValuesRegex = /^label_values\((?:(.+),\s*)?([a-zA-Z_][a-zA-Z0-9_]*)\)\s*$/;
    const labelValuesQuery = request.match(labelValuesRegex);

    if (labelValuesQuery) {
        if (labelValuesQuery[1]) {
            return labelValuesQueryResolver(labelValuesQuery[2], labelValuesQuery[1]);
        }
        return labelValuesQueryResolver(labelValuesQuery[2], null);

    }
}

export function resolveFormatter(unit) {
    let formatter = d => {
        if (typeof d === 'string') {
            if (NUMBER.test(d)) {
                return NumberFormatter.format(d);
            }
        }
        return d;
    };
    if (unit === 'percentunit') {
        formatter = d => (d ? `${(+d * 100).toFixed(2)}%` : '-');
    }

    if (unit === 'bytes') {
        formatter = d => niceBytes(d, memoryUnits);
    }

    if (unit === 'cores') {
        formatter = d => `${d} cores`;
    }

    if (unit === 'Bps') {
        formatter = d => niceBytes(d, BPSunits);
    }

    if (unit === 'pps') {
        formatter = d => `${NumberFormatter.format(d)} pps`;
    }

    if (unit === 'ops') {
        formatter = d => `${NumberFormatter.format(d)} ops/s`;
    }
    if (unit === 's') {
        formatter = d => niceTiming(d);
    }

    // if (unit === 'pps') {
    //     formatter = d => `${NumberFormatter.format(d)}`;
    // }
    return formatter;
}
