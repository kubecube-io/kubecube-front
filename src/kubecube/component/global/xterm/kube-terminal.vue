<template>
  <div
    v-if="show"
    :class="$style.root"
    :minimized="currentMinimized"
  >
    <div
      v-show="!currentMinimized"
      :class="$style.main"
      :maximized="currentMaximized"
    >
      <div
        :class="$style.head"
        @dblclick="maximize"
      >
        <u-linear-layout :class="$style.buttonWrap">
          <span @click.stop="currentMinimized = !currentMinimized">
            <i :class="$style.minimize" />
          </span>
          <span
            @click.stop="maximize"
          ><i
            :class="$style.maximize"
            :maximized="currentMaximized"
          /></span>
          <span @click.stop="closeAll"><i :class="$style.close" /></span>
        </u-linear-layout>
      </div>
      <div
        ref="terminal"
        :class="$style.content"
      />
    </div>
    <div v-show="currentMinimized">
      <div
        :class="$style.minWindow"
        @click="currentMinimized = !currentMinimized"
      />
    </div>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import {
    initSocket,
    initTerm,
} from './utils';
import webconsoleService from 'kubecube/services/webconsole';

export default {
    data() {
        return {
            show: false,
            currentMaximized: false,
            currentMinimized: false,
            loading: false,
            pod: null,
            container: null,

            socketMeta: {},
            termMeta: {},
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
    },
    watch: {
        show(val) {
            if (!val) {
                this.closeConnect();
            }
        },
    },
    destroyed() {
        this.closeConnect();
    },
    methods: {
        closeConnect() {
            if (this.socketMeta && this.socketMeta.socket) {
                this.socketMeta.closing = true;
                const { socket } = this.socketMeta;
                const term = this.termMeta.term;
                socket.send(JSON.stringify({ Op: 'stdin', Data: 'exit \r' }));
                socket.send(JSON.stringify({ Op: 'stdin', Data: 'exit \r' }));
                if (socket) {
                    socket.close();
                }
                if (term) {
                    term.destroy();
                }
                this.socketMeta.connect = false;
            }
        },
        open({
            pod,
            container,
        } = {}) {
            if (this.socketMeta.connect) {
                this.closeConnect();
                this.currentMaximized = false;
                this.currentMinimized = false;
            }
            // this.closeConnect();
            this.pod = pod;
            this.container = container;
            this.initConnect();
            this.show = true;
        },
        async initConnect() {
            try {
                let response;
                if (this.pod && this.container) {
                    response = await webconsoleService.connect({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            pod: this.pod,
                            container: this.container,
                        },
                    });
                } else {
                    response = await webconsoleService.connectCloudShell({
                        pathParams: {
                            cluster: this.cluster,
                        },
                    });
                }
                const id = response.id;
                const href = `/webconsole/api/sockjs?${response.id}`;
                if (!this.socketMeta.connect) {
                    const wrapper = this.$refs.terminal;
                    const connect = initSocket(
                        () => this.termMeta.term,
                        () => {
                            this.initConnect();
                        });
                    this.termMeta.term = initTerm(
                        wrapper,
                        () => this.socketMeta.socket);
                    this.socketMeta = connect(href, id);
                } else {
                    this.socketMeta = this.socketMeta.connect(href, id);
                }

            } catch (err) {
                this.$confirm({
                    title: '提示',
                    content: '无法建立与服务器端的连接',
                    showCancel: false,
                    isCancelPrimary: false,
                    ok: () => { this.show = false; return Promise.resolve(); },
                    cancel: () => { this.show = false; return Promise.resolve(); },
                });
            }
        },
        maximize() {
            this.currentMaximized = !this.currentMaximized;
            if (this.termMeta) {
                this.$nextTick(() => this.termMeta.term.fit());
            }
        },
        closeAll() {
            this.$confirm({
                title: '提示',
                content: '关闭将断开所有服务器连接',
                ok: () => { this.show = false; return Promise.resolve(); },
            });
        },
    },
};
</script>

<style module>
.root{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1001;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
}
.root[minimized] {
    height: 0;
}

.head {
    position: relative;
    background: #444;
    color: white;
    overflow: hidden;
}
.main {
    position: relative;
    overflow: hidden;
    width: 900px;
    height: 300px;
    background: #222;
    color: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.main[maximized]  {
    position: fixed;
    z-index: 901;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    height: auto;
}

.minWindow {
    background: url(./terminator.png) no-repeat;
    cursor: pointer;
    position: fixed;
    z-index: 900;
    bottom: 20px;
    right: 40px;
    width: 64px;
    height: 64px;
    animation: terminator_flash .6s infinite step-end;
}

.main[maximized] .content { height: calc(100vh - 40px) !important; }

.minimize { vertical-align: 4px; }
.maximize { vertical-align: -2px; }
.buttonWrap {
    /* position: absolute;
    top: 0;
    right: 0;
    margin: -3px 10px 0 0;
    height: $head-height;
    line-height: $head-height; */
    float: right;
    margin-right: 10px;
}

.buttonWrap i, .transferWrap i  {
    color: #848484;
    cursor: pointer;
    font-size: 14px;
}
.buttonWrap i:hover, .transferWrap i:hover { color: white; }

.content{
    background: #222;
    color: white;
    height: 260px;
}
.transfer {
    font-size: 20px !important;
}
.transfer::before {
    icon-font: url('i-line-awesome.vue/assets/align-justify.svg');
}
.minimize::before {
    icon-font: url('i-font-awesome.vue/assets/window-minimize.svg');
}
.blank::before {
    icon-font: url('i-font-awesome.vue/assets/external-link-alt-solid.svg');
}
.maximize::before {
    icon-font: url('i-font-awesome.vue/assets/window-maximize.svg');
}
.maximize[maximized]::before {
    icon-font: url('i-font-awesome.vue/assets/window-restore.svg');
}
.close {
    vertical-align: -3px;
    font-size: 18px !important;
}
.close::before {
    icon-font: url('i-font-awesome.vue/assets/times-solid.svg');
}

</style>
