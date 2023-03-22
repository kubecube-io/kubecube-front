import SockJS from 'sockjs-client';
class heartCheck {
    constructor(ws, heartCheckInterval, sendHeartCheckSign) {
        this.timeout = heartCheckInterval || 9 * 60 * 1000; // 9分钟发一次心跳
        this.timeoutObj = null;
        this.serverTimeoutObj = null;
        this.ws = ws;
        this.sendHeartCheckSign = sendHeartCheckSign;
    }

    reset() {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    }

    start() {
        this.timeoutObj = setTimeout(() => {
            // 这里发送一个心跳，后端收到后，返回一个心跳消息，
            // onmessage拿到返回的心跳就说明连接正常
            this.sendHeartCheckSign(this.ws);
            this.serverTimeoutObj = setTimeout(function() { // 如果超过一定时间还没重置，说明后端主动断开了
                console.log('heartCheck close');
                this.ws.close(); // 如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
            }, this.timeout);
        }, this.timeout);
    }
}

// export function initTerm(elem, getSocket, options, terminalInputCallback, terminalResizeCallback) {
//   const term = new Terminal(Object.assign({}, { theme: DEFAULT_THEME }, options));
//   term.open(elem);
//   term.on('resize', (info) => {
//     const socket = getSocket();
//     socket && terminalResizeCallback(socket, info);
//   });

//   term.on('data', str => {
//     const socket = getSocket();
//     socket && terminalInputCallback(socket, str);
//   });
//   term.element.style.padding = '10px';
//   term.fit();
//   term.focus();
//   return term;
// }


export function initSocket(getTerm, afterSocketOpen, processSocketMessage, doReconnect, enableHeartCheck, heartCheckInterval, sendHeartCheckSign, reconnectLimit = 4) {
    let errorCount = 1;
    function connect(href) {
        const socket = new SockJS(href);
        let hc;
        const state = {
            connect,
            socket,
            closing: false,
            error: false,
        };
        socket.onopen = function() {
            errorCount = 1;
            afterSocketOpen(socket);
            if (enableHeartCheck) {
                hc = new heartCheck(socket, heartCheckInterval, sendHeartCheckSign);
                hc.start();
            }
        };
        socket.onmessage = function(event) {
            const term = getTerm();
            processSocketMessage(
                event,
                term,
                () => {
                    hc && hc.reset().start();
                }
            );
        };
        socket.onclose = socket.onerror = function() {
            if (hc) {
                hc.reset();
            }
            const term = getTerm();
            if (state.closing) {
                term && term.writeln('\x1b[31m connect error!  \x1b[0m');
                state.error = true;
                socket && socket.close();
                return;
            }
            socket && socket.close();
            term && term.writeln('\x1b[31m Reconnect... \x1b[0m');
            errorCount++;
            if (errorCount < reconnectLimit) {
                doReconnect();
            } else {
                term.writeln('Reconnect Failed!');
            }
        };
        return state;
    }
    return connect;

}
