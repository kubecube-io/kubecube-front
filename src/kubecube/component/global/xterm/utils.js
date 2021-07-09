import SockJS from 'sockjs-client';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as attach from 'xterm/lib/addons/attach/attach';
Terminal.applyAddon(fit);
Terminal.applyAddon(attach);

const DEFAULT_THEME = {
    backgroud: '#002b36',
    foreground: '#839496',
    cursor: '#839496',
    selection: '#073642',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
};
class heartCheck {
    constructor(ws) {
        this.timeout = 9 * 60 * 1000; // 9分钟发一次心跳
        this.timeoutObj = null;
        this.serverTimeoutObj = null;
        this.ws = ws;
    }

    reset() {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    }

    start() {
        const self = this;
        this.timeoutObj = setTimeout(function() {
            // 这里发送一个心跳，后端收到后，返回一个心跳消息，
            // onmessage拿到返回的心跳就说明连接正常
            self.ws.send('ping');
            console.log('ping!');
            self.serverTimeoutObj = setTimeout(function() { // 如果超过一定时间还没重置，说明后端主动断开了
                console.log('heartCheck close');
                self.ws.close(); // 如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
            }, self.timeout);
        }, this.timeout);
    }
}

export function initTerm(elem, getSocket) {
    const term = new Terminal(Object.assign({}, { theme: DEFAULT_THEME }));
    term.open(elem);
    term.on('resize', ({ cols, rows }) => {
        const socket = getSocket();
        socket && socket.readyState === 1 && socket.send(JSON.stringify({ Op: 'resize', Cols: cols, Rows: rows }));
    });

    term.on('data', str => {
        const socket = getSocket();
        socket && socket.send(JSON.stringify({ Op: 'stdin', Data: str }));
    });
    term.element.style.padding = '10px';
    term.fit();
    term.focus();
    return term;
}

export function initSocket(getTerm, reconnectCallback) {
    let recInterval;
    let errorCount = 1;
    function connect(href, sessionId) {
        const socket = new SockJS(href);
        const hc = new heartCheck(socket);
        if (recInterval) {
            clearTimeout(recInterval);
        }
        const state = {
            connect,
            socket,
            closing: false,
        };
        socket.onopen = function() {
            socket.send(JSON.stringify({ Op: 'bind', SessionID: sessionId }));
        };
        socket.onmessage = function(event) {
            const term = getTerm();
            try {
                const msg = JSON.parse(event.data);
                switch (msg.Op) {
                    case 'stdout':
                        term.write(msg.Data);
                        break;
                    default:
                }
            } catch (err) {
                if (event.data === 'pong') {
                    hc.reset().start();
                }
            }
        };

        socket.onclose = socket.onerror = function() {
            if (state.closing) return;
            const term = getTerm();
            socket && socket.close();
            term.writeln('Reconnect...' + errorCount);
            recInterval = setTimeout(() => {
                errorCount++;
                console.log(errorCount);
                if (errorCount < 4) {
                    reconnectCallback();
                } else {
                    term.writeln('Reconnect Failed!');
                }
            }, 2000);
        };

        return state;
    }

    return connect;

}
