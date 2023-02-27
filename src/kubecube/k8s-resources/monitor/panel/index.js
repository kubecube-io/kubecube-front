import { get } from 'lodash';
import {
    resolveTemplate,
    resolveLegend,
} from '../utils';
import { resolveFormatter } from '../utils';

function resolveTarget(target) {
    const prometheus = target.prometheus || {};
    return {
        legendTemplate: resolveLegend(prometheus.legend),
        query: resolveTemplate(prometheus.query),
    };
}

function resolveTableTarget(target) {
    const prometheus = target.prometheus || {};
    return {
        // legendTemplate: resolveLegend(prometheus.legend),
        ...prometheus,
        query: resolveTemplate(prometheus.query),

    };
}


function resolveTableStyle(style) {
    let formatter = resolveFormatter(style.unit);

    const [ target, targetPattern ] = style.pattern.split(/\s+/);
    let ref;
    if (targetPattern) {
        ref = /#(.+)/.exec(targetPattern || target)[1];
    } else {
        ref = target;
    }

    if (style.link && style.linkUrl) {
        const resolved = resolveTemplate(style.linkUrl);
        // formatter = d => (d ? ({
        //     path: `/control/${ref}s/${d}/monitor`,
        // }) : '');
        formatter = (d, scope) => resolved({
            __cell: d,
            ...scope,
        });
    }
    return {
        // legendTemplate: resolveLegend(prometheus.legend),
        ...style,
        column: meta => ({
            title: style.alias,
            name: ref,
            formatter: d => formatter(d, meta),
            type: style.link ? 'link' : '',
            textwrap: true,
        }),
    };
}

const types = {
    graph: {
        resolve(config) {
            const targets = (get(config, 'targets') || []).map(resolveTarget);
            return {
                axes: get(config, 'axes'),
                type: 'graph',
                datasource: get(config, 'datasource'),
                targets,
                title: get(config, 'title'),
                span: config.span || 6,
                stack: config.stack,
                showPanel: !get(config, 'hidden', false),
            };
        },
    },
    table: {
        resolve(config) {
            const targets = (get(config, 'targets') || []).map(resolveTableTarget);
            const styles = (get(config, 'styles') || []).map(resolveTableStyle);
            return {
                type: 'table',
                datasource: get(config, 'datasource'),
                targets,
                title: get(config, 'title'),
                styles,
                hiddenColumns: get(config, 'hiddenColumns') || [],
                span: config.span || 12,
                showPanel: !get(config, 'hidden', false),
            };
        },
    },
    singleStat: {
        resolve(config) {
            const targets = (get(config, 'targets') || []).map(resolveTableTarget);
            return {
                type: 'singleStat',
                datasource: get(config, 'datasource'),
                targets,
                title: get(config, 'title'),
                span: config.span || 2,
                linkUrl: config.linkUrl &&
                        ((d, scope) => resolveTemplate(config.linkUrl)({
                            __cell: d,
                            ...scope,
                        })),
                formatter: resolveFormatter(config.unit),
                showPanel: !get(config, 'hidden', false),
            };
        },
    },
};

export function resolvePanel(type, config) {
    return types[type].resolve(config);
}
