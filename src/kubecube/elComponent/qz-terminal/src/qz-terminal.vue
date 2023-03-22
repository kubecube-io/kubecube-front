<template>
  <div v-if="showTerminal" :class="$style.root" :minimized="minimized" ref="root">
    <div :class="$style.mainWrap">
      <div v-show="!minimized" :class="$style.main" :maximized="maximized">
        <div :class="$style.head">
          <div :class="$style.buttonWrap">
            <span @click.stop="handleMinimize" :class="$style.btn"><i :class="$style.minimize"></i></span>
            <span @click.stop="handleMaximize" :class="$style.btn"><i :class="$style.maximize" :maximized="maximized"></i></span>
            <span @click.stop="handleClose" :class="$style.btn"><i :class="$style.close"></i></span>
          </div>
        </div>
        <div :class="$style.content" @dblclick.stop :style="{ height: contentHeight + 'px', width: width + 'px' }">
          <div ref="terminal" :class="$style.terminal"></div>
        </div>
      </div>
      <div v-show="minimized" ref="min" :class="$style.min" @dblclick.stop="cancelMinimize"></div>
    </div>
  </div>
</template>
<script>
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as attach from 'xterm/lib/addons/attach/attach';
import 'xterm/dist/xterm.css';
Terminal.applyAddon(fit);
Terminal.applyAddon(attach);
const DEFAULT_THEME = {
    backgroud: '#000000',
    foreground: '#ffffff',
    black: '#191919',
    red: '#F24957',
    green: '#26BD71',
    yellow: '#FFB21A',
    blue: '#337EFF',
    magenta: '#F260B6',
    cyan: '#3DD9AF',
    white: '#FCFCFC',
    brightBlack: '#666666',
    brightRed: '#F67F89',
    brightGreen: '#67D19B',
    brightYellow: '#FFC95E',
    brightBlue: '#70A4FF',
    brightMagenta: '#FC92D0',
    brightCyan: '#86DEC6',
    brightWhite: '#E5E5E5',
};
const INIT_HEAD_HEIGHT = 40;
export default {
    name: 'qz-terminal',
    props: {
        show: { type: Boolean, default: false },
        height: { type: [ Number ], default: 400 },
        width: { type: [ Number ], default: 900 },
        options: { type: Object, default: () => ({}) },
        beforeCloseCheck: Function,
    },
    data() {
        const contentHeight = this.height - INIT_HEAD_HEIGHT;
        return {
            showTerminal: this.show,
            contentHeight,
            minimized: false,
            maximized: false,
            term: null,
            openLing: false,
            closeLing: false,
        };
    },
    watch: {
        showTerminal(val) {
            this.$emit('update:show', val);
            if (val) {
                this.open();
            }
        },
        show(val) {
            if (val) {
                this.showTerminal = val;
            } else {
                this.close();
            }
        },
    },
    mounted() {
        if (this.showTerminal) {
            this.open();
        }
    },
    beforeDestroy() {
        this.close();
    },
    methods: {
        open() {
            if (this.term || this.openLing) {
                return;
            }
            this.openLing = true;
            this.minimized = false;
            this.maximized = false;
            this.showTerminal = true;
            this.$nextTick(() => {
                const term = new Terminal(Object.assign({}, { theme: DEFAULT_THEME }, this.options));
                term.open(this.$refs.terminal);
                term.on('resize', info => {
                    this.$emit('onResizeCallback', info);
                });
                term.on('data', str => {
                    this.$emit('onInputCallback', str);
                });
                term.element.style.padding = '10px';
                term.fit();
                term.focus();
                this.term = term;
                this.openLing = false;
                this.$emit('onOpenCallback', term);
            });
        },
        handleMinimize() {
            this.minimized = true;
        },
        handleMaximize() {
            this.maximized = !this.maximized;
            this.$nextTick(() => {
                if (this.term) {
                    this.term.fit();
                    this.term.focus();
                }
            });
        },
        cancelMinimize() {
            this.minimized = false;
            this.$nextTick(() => {
                if (this.term) {
                    this.term.fit();
                    this.term.focus();
                }
            });
        },
        close() {
            if (!this.showTerminal) {
                return;
            }
            if (this.term) {
                this.term.destroy();
                this.term = null;
            }
            this.showTerminal = false;
            this.closeLing = false;
            this.$emit('onDestroyCallback');
        },
        handleClose() {
            if (this.closeLing) {
                return;
            }
            this.closeLing = true;
            if (this.beforeCloseCheck) {
                const p = new Promise(this.beforeCloseCheck);
                p.then(() => {
                    this.close();
                }).catch(() => {
                    this.closeLing = false;
                });
            } else {
                this.close();
            }
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
    height: 0 !important;
    z-index: 0;
}

@keyframes terminator_flash {
    50%{ background-position: 0 -64px; }
}
.root {
  --head-height: 40px;
  --head-background-color: #444;
  --content-background-color: #222;
}


.mainWrap {
    /* background: rgba(0, 0, 0, 0.6); */
    /* width: 900px; */
}

.main {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}
.main[maximized]  {
    position: fixed;
    z-index: 901;
    top: 0 !important;
    left: 0 !important;
}
.main[maximized] .content {
  height: calc(100vh - var(--head-height)) !important;
  width: 100% !important;
}

.head {
    height: var(--head-height);
    position: relative;
    background: #444;
    color: white;
}


.transferWrap {
    position: fixed;
    left: 50%;
    top: calc(100vh - 195px);
}

.buttonWrap {
    position: absolute;
    top: 0;
    right: 0;
    margin: -3px 10px 0 0;
    height: var(--head-height);
    line-height: var(--head-height);
}

.buttonWrap i, .transferWrap i  {
    color: #848484;
    cursor: pointer;
    font-size: 14px;
}
.buttonWrap i:hover, .transferWrap i:hover { color: white; }

.buttonWrap .btn {
    margin-left: 8px;
}

.minimize { vertical-align: 4px; }
.maximize { vertical-align: -2px; }

.transfer {
    font-size: 20px !important;
}

.transfer::before {
    icon-font: url('./assets/svg/align-justify.svg');
}
.minimize::before {
    icon-font: url('./assets/svg/window-minimize.svg');
}
.blank::before {
    icon-font: url('./assets/svg/external-link-alt-solid.svg');
}
.maximize::before {
    icon-font: url('./assets/svg/window-maximize.svg');
}
.maximize[maximized]::before {
    icon-font: url('./assets/svg/window-restore.svg');
}

.close {
    vertical-align: -3px;
    font-size: 18px !important;
}
.close::before {
    icon-font: url('./assets/svg/times-solid.svg');
}


.content {
    /* height: 400px; */
    /* margin-top: -20px; */
    background: #222;
    color: white;
}

.min {
    background: url('./assets/images/terminator.png') no-repeat;
    cursor: pointer;
    position: fixed;
    z-index: 1200;
    bottom: 20px;
    right: 40px;
    width: 64px;
    height: 64px;
    animation: terminator_flash .6s infinite step-end;
}

.terminal{
  height: 100%;
  width: 100%;
}
</style>
