const VALVE_PATTERN = /([a-zA-Z-]+)\*/;
function logger(...args) {
    if (process.env.NODE_ENV === 'development') {
        console.log(...args);
    }
}
export const EVENTS = {
    REQUEST_NEXT_LEVEL: 'request-next-level',
    REQUEST_CURR_LEVEL: 'request-current-level',
};

export class ValveController {
    constructor(index, map, getALLNextControllers) {
        this.index = index;
        this.map = map;
        this.loading = false;
        this.Valves = new Map();
        this.getALLNextControllers = getALLNextControllers;
    }

    registValve(valve) {
        logger('registValve: ', valve.name);
        this.Valves.set(valve.name, valve);
        valve._emit = this.emitchange.bind(this);
        valve._controller = this;
    }

    unregistValve(valve) {
        logger('unregistValve: ', valve.name);
        valve._emit = null;
        valve._controller = null;
        this.Valves.delete(valve.name);
    }

    emitchange(eventName) {
        // if (eventName === EVENTS.REQUEST_NEXT_LEVEL) {
        // this._pipeemit(eventName, this.index);
        this._pipeemit(eventName, this.getALLNextControllers());
        // }
    }

    request(fromIndex) {
        // console.log(fromIndex, this.loading, this.Valves.size)
        if (this.loading) return Promise.reject(`Valve ${this.name} is loading!`);
        this.loading = true;
        const ps = [];
        if (fromIndex === this) {
            // 处理本层刚加入的valve
            this.Valves.forEach(v => {
                if (v.loading) { ps.push(v.r()); }
            });
            // console.log(ps.length);
        } else {
            this.Valves.forEach(v => {
                ps.push(v.r());
            });
        }
        if (ps.length === 0) {
            this.loading = false;
            return Promise.resolve();
        }

        return Promise.all(ps).finally(() => {
            this.loading = false;
        });
    }
}

export class Valve {
    constructor(
        name,
        requestFunc,
        onError = () => {}
    ) {
        this.name = name;
        this.loading = true;
        this.wrap(requestFunc, onError);
    }

    wrap(requestFunc, onError) {
        this.r = async () => {
            try {
                this.loading = true;
                logger('request: ' + this.name);
                await requestFunc();
                this.loading = false;
                logger('response: ' + this.name);
            } catch (err) {
                console.log(err);
                onError(err);
                this.loading = false;
            }
        };
    }

    emit(eventName) {
        logger('mutation: ' + this.name);
        this._emit(eventName);
    }
}

function resolveGraph(graph) {
    const groups = graph.split(/>/);
    const controllers = [];
    const controllerFinder = [];
    groups.forEach((g, index) => {
        const p = /\[?([a-zA-Z,\s\-()*]+)\]?/.exec(g.trim());
        const valves = p[1].split(',').map(k => k.trim());
        // const keysInFunc = function(key) {
        //     return valves.includes(key);
        // };
        const staticValve = new ValveController(index, valves, () => {
            return controllers.slice(index + 1);
        });
        const dynamicValve = [];
        const dvkey = [];
        const keysInFunc = function(key) {
            for (let i = 0; i < valves.length; i++) {
                const valve = valves[i];
                const matched = VALVE_PATTERN.exec(valve);
                if (matched) {
                    const p = matched[1];
                    // const dynamicIdx = `${index}${p}`;
                    if (key.startsWith(p) && !dvkey.includes(key)) {
                        const c = new ValveController(index, [ key ], () => {
                            const seq = dvkey.findIndex(k => k === key);
                            return dynamicValve.slice(seq).concat(controllers.slice(index + 1));
                        });
                        c._pipeemit = staticValve._pipeemit;
                        dynamicValve.push(c);
                        dvkey.push(key);
                    }
                    const seq = dvkey.findIndex(k => k === key);
                    return {
                        controller: dynamicValve[seq],
                        remove() {
                            dynamicValve.splice(seq, 1);
                            dvkey.splice(seq, 1);
                        },
                    };
                } else if (valve === key) {
                    return {
                        controller: staticValve,
                    };
                }
            }
            return null;
        };
        controllers.push({
            staticValve,
            dynamicValve,
        });
        controllerFinder.push(keysInFunc);
    });

    function findController(valve) {
        const name = valve.name;
        for (let i = 0; i < controllerFinder.length; i++) {
            const target = controllerFinder[i](name);
            if (target) {
                return target;
            }
        }
        return null;
    }

    return {
        controllers,
        registValve(valve) {
            const c = findController(valve);
            if (c) {
                c.controller.registValve(valve);
            }
        },
        unregistValve(valve) {
            const c = findController(valve);
            if (c) {
                console.log(c);
                c.controller.unregistValve(valve);
                c.remove && c.remove();
            }
            // const index = findIndex(valve);
            // controllers[index].unregistValve(valve);
        },
    };
}

export class Pipe {
    constructor(graph) {
        Object.assign(this, resolveGraph(graph));
        this.controllers.forEach(({ staticValve }) => {
            staticValve._pipeemit = this.eventHandler.bind(this);
        });
        this.currReq = [];
        this.loading = false;
    }

    request(nextReqs) {
        if (!nextReqs) nextReqs = this.controllers.slice();
        if (this.loading) return;
        this.loading = true;
        this.currindex = nextReqs[0];
        this.currReq = nextReqs; // this.controllers.slice(index);
        this._req();
    }

    eventHandler(eventName, nextReqs) {
        if (eventName === EVENTS.REQUEST_CURR_LEVEL) {
            this.request(nextReqs);
        }
        // else if (eventName === EVENTS.REQUEST_CURR_LEVEL) {
        //     this.request(controllerIndex);
        // }
    }

    async _req() {
        if (this.currReq.length) {
            let p = this.currReq.shift();
            if (!(p instanceof ValveController)) {
                const {
                    staticValve,
                    dynamicValve,
                } = p;
                if (dynamicValve.length) {
                    this.currReq = dynamicValve.concat(this.currReq);
                }
                p = staticValve;
            }
            try {
                await p.request(this.currindex);
                await this._req();
            } catch (err) {
                console.log(err);
                this.currReq = [];
                this.loading = false;
            }
        } else {
            this.loading = false;
        }
    }
}

