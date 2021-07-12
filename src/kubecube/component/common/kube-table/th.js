/**
    column: {
        type: 'normal' | 'selection' | 'sort' | 'filter'

    }
 */
import { cloneDeep } from 'lodash';
import thSelection from './th-selection.vue';
import thIcon from './th-icon.vue';
import resizeBar from './resize-bar.vue';
const defaultColumn = {
    type: 'normal',
    width: 'auto',
};
export default {
    functional: true,
    props: {
        itemKey: String,
        column: Object,
        columnMeta: Object,
        rows: Array,
        topslots: Object,
        resizable: Boolean,
        maxHeight: String,
    },
    data() {
        return {
            columnNormalized: {
                ...defaultColumn,
                ...this.data,
            },
        };
    },
    render(h, context) {
        const {
            itemKey,
            column,
            columnMeta = {},
            rows,
            topslots,
            resizable,
            maxHeight,
        } = context.props;
        const columnCopy = cloneDeep(column);
        const {
            name,
            title,
            sortable,
            type,
        } = columnCopy;

        let vnodes;

        if (type === 'selection') {
            return h(thSelection, {
                props: {
                    itemKey,
                    column,
                    rows,
                    columnMeta,
                },
            });
        }

        if (topslots && topslots[`column.${name}`]) {
            vnodes = topslots[`column.${name}`]({
                column,
            });
        } else {
            vnodes = [ h('span', title) ];
        }
        const props = {
            key: name,
            attrs: {
                title,
            },
            style: {
                cursor: 'pointer',
                position: maxHeight ? undefined : 'relative',
            },
        };
        if (sortable) {
            const {
                order,
                sort,
            } = columnMeta;
            props.on = {
                click: () => {
                    const sortEvent = context.listeners.sort;
                    sortEvent({
                        order: order ? (order === 'asc' ? 'desc' : 'asc') : 'asc',
                        name,
                    });
                },
            };
            const icon = (order && order === 'desc') ? 'arrow-down' : 'arrow-up';
            vnodes.push(h(thIcon, { attrs: { name: icon }, props: { role: sort } }));
        }

        if (resizable) {
            vnodes.push(h(resizeBar, {
                props: {
                    column,
                },
                on: {
                    mousedown: context.listeners.beginResize,
                    // mousemove: context.listeners.resizing,
                    // mouseup: context.listeners.endResize,
                },
            }));
        }

        return h('th', props, vnodes);
    },
    // render(c) {
    //     let comp = thNormal;
    //     if (this.columnNormalized.type === 'selection') {
    //         comp = thSelection;
    //     }
    //     if (this.columnNormalized.type === 'empty') {
    //         comp = emptyTh;
    //     }
    //     return c(comp, {
    //         // attrs: {
    //         //     width: this.data.width,
    //         // },
    //         props: {
    //             itemKey: this.itemKey,
    //             column: this.data,
    //             columnMeta: this.columnMeta,
    //             rows: this.rows,
    //         },
    //     });
    // },
};
