import { Modal, Subscribe, Page as InitPage } from '@necfe/cloud-ui-internal/src/mixins.js';
import Inputs from './inputs';

// 给 Page 增加 selectPage 方法
const Page = Object.assign({}, InitPage, { 
    methods: Object.assign({}, InitPage.methods, {
        // 更改页数 || limit 操作的回调函数
        selectPage({ pageSize, page = 1 }) {
            this.page = page;
            this.form && Object.assign(this.form, {
                limit: pageSize,
                offset: (page - 1) * pageSize,
            });
            this.loadList && this.loadList();
        },
    }),
});

export {
    Modal, Subscribe, Page, Inputs
}