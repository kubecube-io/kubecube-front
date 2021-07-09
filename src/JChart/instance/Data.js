import { effect, reactive } from '@vue/reactivity';
// import { queueJob } from '../schedule';
import { REFERENCE_TYPE } from '../shared/utils';
import { cloneDeep } from 'lodash';
class Data {
    constructor(options, queueJob) {

        this.source = reactive({
            data: [],
            legend: [],
            reference: {},
            stack: false,
        });
        this.sourceMeta = reactive({
            xMinMax: {},
            yMinMax: {},
            xDataSpan: {},
            yDataSpan: {},
        });
        this.queueJob = queueJob;

        this.resetData(options);
        this.initEffect();
    }
    resetData(options) {
        // // console.log('resetData');
        const s = options.series;
        const reference = options.reference;
        const stack = !!options.stack;

        const dataSource = [];
        let dataLegend = [];
        // // console.log(s);
        const ref = s[0].values.map(v => v[0]);

        if(stack) {
            const tempseries = [];
            ref.forEach((d, idx) => {
                const p = [];
                // let reduced = 0;
                s.forEach(({ values }) => {
                    const value = values[idx] ? values[idx][1]: 0;
                    p.push(value);
                });
                tempseries.push([d, ...p]);
            });
            dataLegend = s.map(sd => ({
                name: sd.name,
                disabled: false,
            }));
            dataSource.push(tempseries);
        } else {
            s.forEach(({name, values}) => {
                dataSource.push(values);
                dataLegend.push({
                    name,
                    disabled: false,
                });
            });
        }
        Object.assign(this.source, {
            data: cloneDeep(dataSource),
            legend: cloneDeep(dataLegend),
            reference: Object.assign({
                ref,
                type: REFERENCE_TYPE.continuous
            }, reference),
            stack,
        });
    }

    initEffect(){
        effect(() => {
            // console.log('data init effect');
            const {
                data,
                legend,
                stack
            } = this.source;
            let xmin = Infinity;
            let ymin = Infinity;
            let xmax = -Infinity;
            let ymax = -Infinity;

            // const indexMapping = {};
            // const indexMappingInverse = {};
            // let counter = 0;
            // const filtedLg = legend.filter((l, idx) => {
            //     if(!l.disabled) {
            //         indexMapping[counter] = idx;
            //         indexMappingInverse[idx] = counter;
            //         counter++;
            //     }
            //     return !l.disabled;
            // })
            if(stack) {
                const allData = data[0];
                allData.forEach((v) => {
                    const x = v[0];
                    xmin = Math.min(x, xmin);
                    xmax = Math.max(x, xmax);
                    let y = 0;
                    legend.forEach((l, i) => {
                        if(!l.disabled) {
                            y += v[i+1];
                        }
                    });
                    ymin = Math.min(y, ymin);
                    ymax = Math.max(y, ymax);
                });

            } else {
                legend.forEach((l, i) => {
                    if(!l.disabled) {
                        const values = data[i];
                        values.forEach((v) => {
                            const y = v[1];
                            const x = v[0];
                            xmin = Math.min(x, xmin);
                            xmax = Math.max(x, xmax);
                            ymin = Math.min(y, ymin);
                            ymax = Math.max(y, ymax);
                        });
                    }
                });
            }
            Object.assign(this.sourceMeta, {
                yMinMax: { min: ymin, max: ymax },
                xMinMax: { min: xmin, max: xmax },
                // indexMapping,
                // indexMappingInverse,
            });
            // console.log(this.sourceMeta.yMinMax);

        }, {
            scheduler: this.queueJob,
        });
    }
}

export default Data;
