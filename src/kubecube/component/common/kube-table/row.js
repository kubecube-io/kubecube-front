import { cloneDeep, get } from 'lodash';
import selectionComp from './row-selection.vue';
import cellTag from './cell-tag.vue';
export default {
    functional: true,
    props: {
        data: Object,
        dataMeta: Object,
        itemKey: String,
        columns: Array,
        columnMeta: Array,
        topslots: Object,
        appendant: {
            type: Object,
            default: () => ({}),
        },
    },
    render(h, context) {
        const {
            columns,
            data,
            topslots,
            itemKey,
            columnMeta,
            dataMeta,
        } = context.props;
        const dataCopy = cloneDeep(data);
        const tds = columns.map((c, index) => {
            const cmeta = columnMeta[index];
            const name = c.name;
            let vnodes;
            if (topslots && topslots[`item.${name}`]) {
                vnodes = [ h('span', {
                    class: {
                        'kube-textwrap': c.textwrap,
                        'kube-texthidden': !c.textwrap,
                    },
                }, topslots[`item.${name}`]({
                    item: dataCopy,
                    itemMeta: dataMeta,
                    column: c,
                })) ];
            } else if (c.type === 'tag') {
                vnodes = [ h(cellTag, {
                    props: {
                        list: (get(dataCopy, name) || []),
                        ...(c.cellprops || {}),
                    },
                }) ];
            } else if (c.type === 'selection') {
                vnodes = [ h(selectionComp, {
                    props: {
                        itemKey,
                        data: dataCopy,
                        column: c,
                        columnMeta: cmeta,
                    },
                }) ];
            } else if (c.type === 'link') {
                const value = get(dataCopy, name, '-');
                vnodes = [ h('el-link', {
                    props: {
                        to: { path: c.formatter ? c.formatter(value) : value },
                    },
                    attrs: {
                        title: value,
                        type: 'primary',
                        style: 'display: inline-block; font-size: 12px',
                    },
                    class: {
                        'kube-textwrap': c.textwrap,
                        'kube-texthidden': !c.textwrap,
                    },
                }, value) ];
            } else {
                vnodes = [ h('span', {
                    class: {
                        'kube-textwrap': c.textwrap,
                        'kube-texthidden': !c.textwrap,
                    },
                    attrs: {
                        title: c.formatter ? c.formatter(get(dataCopy, name)) : get(dataCopy, name, '-'),
                    },
                }, c.formatter ? c.formatter(get(dataCopy, name)) : get(dataCopy, name, '-')) ];
            }

            return h('td', { key: index }, vnodes);
        });
        return h('tr', { key: dataCopy[itemKey] }, tds);
    },
};
