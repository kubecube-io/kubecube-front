<template>
  <div>
    <div class="kube-float-layout">
      <div
        v-for="({key, title}) in keys"
        :key="key"
        :class="$style.inputblock"
      >
        <u-text>{{ title }}:  </u-text>
        <u-input
          :value="searchbody[key]"
          @change="debounceonChange($event.value, key)"
        />
      </div>
      <div :class="$style.inputblock">
        <u-text :class="$style.required">
          请求时间:
        </u-text>

        <u-date-picker
          time="start"
          :date="searchbody.startTime"
          :max-date="searchbody.endTime"
          @select="startTimeSelect"
        />
        <span :class="$style.spliter"> 至 </span>
        <u-date-picker
          time="end"
          :date="searchbody.endTime"
          :min-date="searchbody.startTime"
          @select="endTimeSelect"
        />
      </div>
      <div :class="$style.inputblock">
        <u-button @click="exportAudit">
          导出
        </u-button>
      </div>
    </div>
    <x-request
      ref="request"
      :service="service"
      :params="{
        params: {
          ...searchbody,
          startTime: searchbody.startTime / 1000,
          endTime: searchbody.endTime / 1000,
          page: pagenation.pageNum,
          size: pagenation.pageSize,
          sortBy: pagenation.sortName,
          sortAsc: pagenation.sortOrder === 'asc'
        }
      }"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          :items="data ? data.list : []"
          :error="error"
          :resizable="true"
          @sort="onSort"
        >
          <template #[`item.EventTime`]="{ item }">
            {{ item.EventTime * 1000 | formatLocaleTime }}
          </template>
          <template #[`item.ResponseStatus`]="{ item }">
            <u-label :color="responseCodeColorsMap(item.ResponseStatus)">
              {{ item.ResponseStatus }}
            </u-label>
          </template>
          <template #noData>
            暂无审计信息
          </template>
        </kube-table>
        <u-page
          v-if="data && calculatePages(data.total) > 1"
          :count="data.total"
          :page-size="pagenation.pageSize"
          :total="calculatePages(data.total)"
          @select="selectPage"
        />
      </template>
    </x-request>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import auditService from 'kubecube/services/audit';
import PageMixin from 'kubecube/mixins/pagenation';
export default {
    metaInfo: {
        title: '操作审计 - kubecube',
    },
    mixins: [ PageMixin ],
    data() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const timestamp = startOfDay.getTime();
        return {
            service: auditService.getAudit,
            keys: [{
                title: '账号',
                key: 'userName',
            }, {
                title: 'IP地址',
                key: 'sourceIpAddress',
            }, {
                title: '资源名称',
                key: 'resourceName',
            }, {
                title: '事件名称',
                key: 'eventName',
            }, {
                title: '响应状态',
                key: 'responseStatus',
            }],
            searchbody: {
                startTime: (timestamp - 24 * 60 * 60 * 1000),
                endTime: timestamp,
                userName: '',
                eventName: '',
                // page,
                resourceName: '',
                responseStatus: '',
                sourceIpAddress: '',
                // size,

            },
            columns: [
                { title: '账号', name: 'UserIdentity.AccountId' },
                { title: '时间', name: 'EventTime', sortable: true },
                { title: 'IP地址', name: 'SourceIpAddress' },
                { title: '事件名称', name: 'EventName', textwrap: true },
                { title: '资源', name: 'ResourceList', textwrap: true },
                { title: '状态', name: 'ResponseStatus' },
            ],
            debounceonChange: debounce(this.onChange, 300),
        };
    },
    methods: {
        onChange(val, key) {
            this.searchbody[key] = val;
        },
        resolver(response) {
            console.log(response);
            return {
                list: (response.Events || []).map(event => ({
                    ...event,
                    ResourceList: (event.ResourceList || []).map(({ ResourceType, ResourceName, ResourceId }) => `资源类型:${ResourceType}, 资源名称:${ResourceName}, 资源ID:${ResourceId}`).join(','),
                })),
                total: response.Total,
            };
        },
        startTimeSelect({ date }) {
            this.searchbody.startTime = date.getTime();
        },
        endTimeSelect({ date }) {
            this.searchbody.endTime = date.getTime();
        },
        onSort({ order, name }) {
            this.pagenation.sortOrder = order;
            this.pagenation.sortName = `${name}`;
        },
        async exportAudit() {
            const response = await auditService.exportAudit({
                params: {
                    ...this.searchbody,
                    startTime: this.searchbody.startTime / 1000,
                    endTime: this.searchbody.endTime / 1000,
                },
            });
            const url = 'data:text/csv;charset=utf-8,' + encodeURIComponent(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'audit.csv';
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove(); // aft
        },
        responseCodeColorsMap(code) {
            code = code + '';
            if (/^2/.test(code)) {
                return 'success';
            } else if (/^3/.test(code)) {
                return 'primary';
            } else if (/^4/.test(code)) {
                return 'warning';
            } else if (/^5/.test(code)) {
                return 'error';
            }
            return 'default';
        },
    },
};
</script>

<style module>
.inputblock{
    display: inline-block;
    margin: 5px 15px;
}
.inputblock > span:first-child{
    display:inline-block;
    width: 5em;
}
.spliter{
    display: inline-block;
    text-align: center;
    width: 2em;
}
.timer{
    width: 10em;
}
.required:after {
    content: '*';
    color: red;
}

</style>
