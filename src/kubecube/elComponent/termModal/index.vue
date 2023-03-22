<template>
  <div :class="$style.webconsoleModal">
    <qz-terminal
      ref="terminal"
      :show.sync="showModal"
      :height="height"
      :width="width"
      :options="options"
      :beforeCloseCheck="beforeCloseCheck"
      @onOpenCallback="onOpenCallback"
      @onResizeCallback="onResizeCallback"
      @onInputCallback="onInputCallback"
      @onDestroyCallback="onDestroyCallback"
    />
  </div>
</template>
<script>
import {
    initSocket,
} from './utils';
// import customConfig from '@micro-app/common/utils/customization';
// import cookie from '@micro-app/common/utils/handleCookie';
import webconsoleService from 'kubecube/services/webconsole';
export default {
    props: {
        enableHeartCheck: {
            type: Boolean,
            default: true,
        },
        options: { type: Object, default: () => ({}) }, //
    },
    data() {
        return {
            enableWebconsoleAudit: false,
            heartCheckInterval: 3 * 60 * 1000, // 心跳间隔
            showModal: false,
            height: 300,
            width: 900,
            globalBaseURL: '',
            connectType: '', // container or cloudShell
            connectParams: null,
            sessionId: '',
            reloadSessionIdLimit: 4,
            term: null,
            socketMeta: {},
            cols: 97,
            rows: 13,
        };
    },
    mounted() {
        window.addEventListener('beforeunload', this.forceClose);
    },
    methods: {
        forceClose() {
            this.showModal = false;
            const { socket } = this.socketMeta;
            socket && socket.send(JSON.stringify({ Op: 'stdin', Data: 'exit \r' }));
            socket && socket.send(JSON.stringify({ Op: 'stdin', Data: 'exit \r' }));
            socket && socket.close();
            window.removeEventListener('beforeunload', this.forceClose);
        },
        open(connectType, connectParams) {
            this.connectParams = connectParams;
            this.connectType = connectType;
            this.showModal = true;
        },
        async loadSessionId() {
            let href = '';
            try {
                let res = {};
                if (this.connectType === 'container') {
                    res = await webconsoleService.connect({
                        pathParams: {
                            ...this.connectParams,
                        },
                    });
                }
                if (this.connectType === 'cloudShell') {
                    res = await webconsoleService.connectCloudShell({
                        pathParams: {
                            ...this.connectParams,
                        },
                    });
                }
                const sessionId = res.id;
                href = this.globalBaseURL + '/webconsole/api/sockjs?' + sessionId;
                // if (this.enableWebconsoleAudit) {
                //     // 审计
                //     href += ('&webuser=' + cookie.readCookie('accountId'));
                // }
                this.sessionId = sessionId;
            } catch (error) {
                console.log(error);
                href = await this.reLoadSessionId(1);
            }
            return href;
        },
        async reLoadSessionId(currentCount) {
            let href = '';
            if (currentCount < this.reloadSessionIdLimit) {
                try {
                    // const res = await service.loadStatus(this.connectParams);
                    let res = {};
                    if (this.connectType === 'container') {
                        res = await webconsoleService.connect({
                            pathParams: {
                                ...this.connectParams,
                            },
                        });
                    }
                    if (this.connectType === 'cloudShell') {
                        res = await webconsoleService.connectCloudShell({
                            pathParams: {
                                ...this.connectParams,
                            },
                        });
                    }
                    const sessionId = res.id;
                    href = this.globalBaseURL + '/webconsole/api/sockjs?' + sessionId;
                    // if (this.enableWebconsoleAudit) {
                    //     // 审计
                    //     href += ('&webuser=' + cookie.readCookie('accountId'));
                    // }
                    this.sessionId = sessionId;
                } catch (error) {
                    return this.reLoadSessionId(currentCount + 1);
                }
            } else {
                this.$eConfirm({
                    title: '提示',
                    message: '无法建立与服务器端的连接',
                    width: '460px',
                    ok: () => Promise.resolve(),
                    cancel: () => Promise.resolve(),
                });
            }
            return href;
        },
        afterCreateSession(socket) {
            socket.send(JSON.stringify({ Op: 'bind', SessionID: this.sessionId }));
            socket.send(JSON.stringify({ Op: 'resize', Cols: this.cols, Rows: this.rows }));
        },
        processServiceMessage(event, term, resetHeartCheck) {
            try {
                const msg = JSON.parse(event.data);
                console.log(msg);
                switch (msg.Op) {
                    case 'stdout':
                        if (msg.Data === '\r\n\u001b[?2004l\rexit\r\n') {
                            this.forceClose();
                            return;
                        }
                        term.write(msg.Data);
                        break;
                    default:
                }
            } catch (err) {
                if (event.data === 'pong') {
                    resetHeartCheck();
                }
            }
        },
        async doReconnect() {
            const href = await this.loadSessionId();
            if (!this.showModal) {
                return;
            }
            if (href) {
                this.initConnect(href);
            } else {
                this.showModal = false;
                this.socketMeta = {};
            }
        },
        sendHeartCheckSign(socket) {
            socket.send('ping');
        },
        initConnect(href) {
            if (!this.socketMeta.connect) {
                const { enableHeartCheck, heartCheckInterval } = this;
                const connect = initSocket(
                    () => this.term,
                    socket => this.afterCreateSession(socket),
                    (event, term, resetHeartCheck) => this.processServiceMessage(event, term, resetHeartCheck),
                    () => this.doReconnect(),
                    enableHeartCheck,
                    heartCheckInterval,
                    socket => this.sendHeartCheckSign(socket)
                );
                this.socketMeta = connect(href);
            } else {
                this.socketMeta = this.socketMeta.connect(href);
            }
        },
        beforeCloseCheck(ok, cancle) {
            console.log(this.socketMeta);
            this.socketMeta.closing = true;
            this.$eConfirm({
                title: '提示',
                message: '关闭将断开所有服务器连接',
                width: '460px',
                customClass: this.$style.customDialogClass,
                ok: () => {
                    const { socket } = this.socketMeta;
                    socket && socket.send(JSON.stringify({ Op: 'stdin', Data: 'exit \r' }));
                    socket && socket.send(JSON.stringify({ Op: 'stdin', Data: 'exit \r' }));
                    socket && socket.close();
                    ok();
                    return Promise.resolve();
                },
                cancel: () => {
                    if (this.socketMeta.error) {
                        this.socketMeta.error = false;
                        this.doReconnect();
                    }
                    cancle();
                    return Promise.resolve();
                },
            });
        },
        async onOpenCallback(term) {
            this.term = term;
            const href = await this.loadSessionId();
            if (href) {
                this.initConnect(href);
            } else {
                this.showModal = false;
            }
        },
        onResizeCallback({ cols, rows }) {
            const socket = this.socketMeta.socket;
            this.cols = cols;
            this.rows = rows;
            socket && socket.send(JSON.stringify({ Op: 'resize', Cols: cols, Rows: rows }));
        },
        onInputCallback(str) {
            const socket = this.socketMeta.socket;
            socket && socket.send(JSON.stringify({ Op: 'stdin', Data: str }));
        },
        onDestroyCallback() {
            this.term = null;
            this.socketMeta = {};
        },
    },
};
</script>
<style module>
.webconsoleModal{

}
.customDialogClass {
  z-index: 11000 !important;
}
</style>
