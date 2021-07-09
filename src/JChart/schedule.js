var __DEV__ = true;
function callWithErrorHandling(
    fn,
    instance,
    type,
    args,
) {
    let res;
    try {
        res = args ? fn(...args) : fn();
    } catch (err) {
        // console.log(err);
    }
    return res;
}
const RECURSION_LIMIT = 50;

export function initSchedule() {
    const queue = [];
    const postFlushCbs = [];
    // const p = Promise.resolve()

    let isFlushing = false;
    let isFlushPending = false;
    // const p = Promise.resolve();
    // export function nextTick(fn) {
    //   return fn ? p.then(fn) : p
    // }

    // 绘图用到的是 requestAnimationFrame
    function nextTick(fn) {
        return fn ? requestAnimationFrame(() => {
            fn();
        }) : requestAnimationFrame();
        // return fn ? p.then(fn) : p
    }

    function queueJob(job) {
        if (!queue.includes(job)) {
            queue.push(job);
            queueFlush();
        }
    }

    function queueFlush() {
        if (!isFlushing && !isFlushPending) {
            isFlushPending = true;
            nextTick(flushJobs);
        }
    }
    function flushPostFlushCbs(seen) {
        if (postFlushCbs.length) {
            const cbs = [...new Set(postFlushCbs)];
            postFlushCbs.length = 0;
            if (__DEV__) {
                seen = seen || new Map();
            }
            for (let i = 0; i < cbs.length; i++) {
                if (__DEV__) {
                    checkRecursiveUpdates(seen, cbs[i]);
                }
                cbs[i]();
            }
        }
    }


    const getId = (job) => (job.id == null ? Infinity : job.id);

    function flushJobs(seen) {
        isFlushPending = false;
        isFlushing = true;
        let job;
        if (__DEV__) {
            seen = seen || new Map();
        }

        // Sort queue before flush.
        // This ensures that:
        // 1. Components are updated from parent to child. (because parent is always
        //    created before the child so its render effect will have smaller
        //    priority number)
        // 2. If a component is unmounted during a parent component's update,
        //    its update can be skipped.
        // Jobs can never be null before flush starts, since they are only invalidated
        // during execution of another flushed job.
        queue.sort((a, b) => getId(a) - getId(b));
        while ((job = queue.shift()) !== undefined) {
            if (job === null) {
                continue;
            }
            if (__DEV__) {
                checkRecursiveUpdates(seen, job);
            }
            callWithErrorHandling(job, null, 'SCHEDULER');
        }
        flushPostFlushCbs(seen);
        isFlushing = false;
        // some postFlushCb queued jobs!
        // keep flushing until it drains.
        if (queue.length || postFlushCbs.length) {
            flushJobs(seen);
        }
    }

    function checkRecursiveUpdates(seen, fn) {
        if (!seen.has(fn)) {
            seen.set(fn, 1);
        } else {
            const count = seen.get(fn);
            if (count > RECURSION_LIMIT) {
                throw new Error(
                    'Maximum recursive updates exceeded. ' +
                    "You may have code that is mutating state in your component's " +
                    'render function or updated hook or watcher source function.'
                );
            } else {
                seen.set(fn, count + 1);
            }
        }
    }
    return { queueJob, nextTick };
}