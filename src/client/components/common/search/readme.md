const tagTypes = [
    {
        label: '名称',
        type: 'name',
        check() {
            return this.values.length === 1 && this.values[0];
        },
        datas: [
            {
                type: 'input',
            },
        ],
        show() {
            return `${this.label ? this.label + ':' : ''}${this.values.join()}`;
        },
        limit: 10, // 该条件最多可输入10条
    },
    {
        label: '私有网 IP',
        type: 'privateIP',
        check() {
            const values = this.values;
            let pass = false;
            if (values.length === 1 && values[0]) {
                const ips = values[0].split('.');
                if (ips.length === 4)
                    pass = ips.every((item, index) => item && (item - 0 >= 0 && item - 0 <= 255));
            }
            return pass;
        },
        datas: [
            {
                type: 'input',
            },
        ],
        show() {
            return `${this.label ? this.label + ':' : ''}${this.values.join('')}`;
        },
    },
    {
        label: 'VPC',
        type: 'networkId',
        check() {
            return this.values.length === 1 && this.values[0];
        },
        datas: [
            {
                type: 'select',
                remote() {
                    return Promise.resolve().then((vpc) => {
                        const s1 = Math.random();
                        const s2 = Math.random();
                        return [
                            {
                                type: s1,
                                label: s1,
                                unique: true,
                                type2: [], // 自定义属性，可以辅助判断等
                            },
                            {
                                type: s2,
                                label: s2,
                                unique: true,
                                type2: [], // 自定义属性，可以辅助判断等
                            },
                        ];
                    });
                },
            },
        ],
        show() {
            return `${this.label ? this.label + ':' : ''}${this.values.join('')}`;
        },
    },
];