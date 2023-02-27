import { get } from 'lodash';
import { getFromModel } from '../base/utils';
import {
    resolveVariablesRequest,
} from './utils';
import {
    resolvePanel,
} from './panel';

const resolvePanelObj = panel => {
    const keys = Object.keys(panel);
    const type = get(keys, '[0]');
    return resolvePanel(type, panel[type]);
};

const resolveRow = row => {
    const g = getFromModel(row);
    const panels = g('panels') || [];
    return {
        name: g('name'),
        panels: panels.map(resolvePanelObj),
    };
};

const resolveVariable = varible => {
    const g = getFromModel(varible);
    return {
        displayName: g('query.label'),
        name: g('query.name'),
        request: resolveVariablesRequest(g('query.request')),
    };
};

export const toPlainObject = model => {
    const g = getFromModel(model);
    const rows = g('spec.rows') || [];
    const variables = g('spec.variables') || [];
    return {
        title: g('spec.title'),
        variables: variables.map(resolveVariable),
        rows: rows.map(resolveRow),
        selectshowable: g('spec.selectshowable', ''), // 是否开启维度选择
    };
};
