export default {
    preventDefault($event) {
        if ($event) {
            $event.preventDefault();
        }
    },
    updateSelected(type, value, index, isDelete) {
        let selected = this.info.selected[type];
        if (isDelete) {
            if (selected && selected[index] && selected[index].indexOf(value) !== -1) {
                selected[index].splice(selected[index].indexOf(value), 1);
            }
        } else {
            if (!selected || !selected[index]) {
                selected = this.info.selected[type] = {
                    [index]: [],
                };
            }
            selected[index].push(value);
            selected[index] = Array.from(new Set(selected[index]));
        }
    },
    autoDeleteSelected(current) {
        current = current || this.current;
        const selected = this.info.selected[current.type];
        if (selected) {
            Object.keys(selected).forEach((item) => {
                this.updateSelected(current.type, current.values[item], item, true);
            });
        }
    },
};
