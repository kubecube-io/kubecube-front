import { Emitter } from 'cloud-ui.vusion';
// import io from 'socket.io-client';
// Sockjs
import SockJS from 'sockjs-client';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as attach from 'xterm/lib/addons/attach/attach';
Terminal.applyAddon(fit);
Terminal.applyAddon(attach);

export default {
    name: 'x-term',
    parentName: 'x-term-group',
    mixins: [ Emitter ],
    props: {
        value: null, // 这里里后端返回的一个 id 作为唯一标示
        options: Object,
        selected: false,
        title: { type: String, default: '-' },
        // show: { type: Boolean, default: false },
        href: String,
        // extra: { type: Object, default: () => ({}) }, // todo:
    },
    watch: {
    },
    data() {
        return {
            hasMounted: false, // 生命周期是否到了mounted
            parentVM: undefined,
            term: null,
            socket: null,
            content: '',
            timeId: null,
            defaultOptions: {
                theme: { background: '#222' },
            },
        };
    },
    computed: {
        selected() {
            return this.parentVM && this.parentVM.selectedVM === this;
        },
        isMax() {
            return this.parentVM && this.parentVM.maximized;
        },
    },
    watch: {
        // todo: 支持多个tab
        // selected(value) {
        //     if(value && this.value && this.hasMounted && !this.term) {
        //         this.timeId && clearTimeout(this.timeId);
        //         this.timeId = setTimeout(() => this.init());
        //     }
        // },
        value(value) {
            if(value && this.selected && this.hasMounted && !this.term) {
                this.timeId && clearTimeout(this.timeId);
                this.timeId = setTimeout(() => this.init());
            }
        },
        // 是否最大化
        isMax(value) {
            this.term && this.term.fit();
        },
    },
    created() {
        this.dispatch(this.$options.parentName, 'add-item-vm', this);
    },
    destroyed() {
        this.dispatch(this.$options.parentName, 'remove-item-vm', this);
        this.timeId && clearTimeout(this.timeId);
        this.term && this.term.destroy();
        this.socket && this.socket.close();
    },
    mounted() {
        this.hasMounted = true;
    },
    methods: {
        // sockjs
        init() {
            // 这里通过$refs的方式获取dom节点有问题
            const target = document.getElementById('terminal-' + this.value);
            this.term = new Terminal(Object.assign({}, this.defaultOptions, this.options));
            // for debug
            // window.term = this.term;
            this.term.open(target);

            this.term.on('resize', ({ cols, rows }) => this.onTermResize(cols, rows));
            this.term.on('data', (str) => this.onTermInput(str));
            this.setPadding(10);
            this.term.focus();
            
            setTimeout(() => {
                this.socket = new SockJS(this.href);
                this.socket.onopen = this.runRealTerm.bind(this);
                this.socket.onmessage = this.onSocketMessage.bind(this);
                this.socket.onclose = this.runFakeTerm.bind(this, 'close');
                this.socket.onerror = this.runFakeTerm.bind(this, 'error');
            });
        },
        runRealTerm() {
            this.socket.send(JSON.stringify({'Op': 'bind', 'SessionID': this.value}));
            this.term._initialized = true;
            // 触发一次resize事件，这样能够给后端的pty一个初始尺寸
            this.onTermResize(this.term.cols, this.term.rows);
        },
        // type: close || error
        runFakeTerm(type) {
            // 针对 socket 连接之后马上就关闭了
            if (this.term._initialized) {
                this.socket && this.socket.close();    
                // this.term.write('Login...');
                this.term.blur();
                this.dispatch(this.$options.parentName, 'exit-item-vm', this);
                return;
            }

            this.term._initialized = true;

            const prompt = () => {
                this.term.write('\r\n$ ');
            };
            this.term.writeln('This is a local terminal emulation, without a real terminal in the back-end.');
            this.term.writeln('Type some keys and commands to play around');
            prompt();

            this.term._core.register(this.term.addDisposableListener('key', (key, event) => {
                const printable = !event.altKey && !event.altGraphKey && !event.ctrlKey && !event.metaKey;
            
                if (event.keyCode === 13)
                    prompt();
                else if (event.keyCode === 8) {
                    // Do not delete the prompt
                    if (this.term.x > 2)
                        this.term.write('\b \b');
                } else if (printable)
                    this.term.write(key);
            }));
            
            this.term._core.register(this.term.addDisposableListener('paste', (data, ev) => {
                this.term.write(data);
            }));
        },
        onSocketMessage(event) {
            let msg = JSON.parse(event.data);
            switch (msg['Op']) {
                case 'stdout':
                    this.term.write(msg['Data']);
                    break;
                // case 'toast':
                //     this.io.showOverlay(msg['Data']);
                //     break;
                default:
                // console.error('Unexpected message type:', msg);
            }
        },
        onTermResize(columns, rows) {
            // 只有开启了socket连接(readyState === 1)，否则socket.send会报错
            this.socket && this.socket.readyState === 1 && this.socket.send(JSON.stringify({'Op': 'resize', 'Cols': columns, 'Rows': rows}));
        },
        onTermInput(str) {
            this.socket.send(JSON.stringify({'Op': 'stdin', 'Data': str}));
        },
        // 更新term样式的一些方法
        setPadding(num) {
            this.term.element.style.padding = parseInt(num, 10).toString() + 'px';
            this.term.fit();
        },
    },
}
