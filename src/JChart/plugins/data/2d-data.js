import { REFERENCE_TYPE } from '../../shared/utils';
import { cloneDeep } from 'lodash';
import { getYAxis, getXAxis, rountToRange } from '../../shared/utils';
import BigNumber from 'bignumber.js';

class Data2D {
    apply(globalCtx) {
        const name = 'Data2D';
        globalCtx.globalData.hooks.initData.tap(name, (dataOptions, source, sourceMeta) => {
            this.init(globalCtx, dataOptions, source, sourceMeta);
        });
        globalCtx.globalData.hooks.resetData.tap(name, (dataOptions, source) => {
            this.resetData(dataOptions, source);
        });
    }

    init(globalCtx, dataOptions, source, sourceMeta) {
        Object.assign(source, {
            data: [],
            legend: [],
            reference: {},
            stack: false,
        });
        Object.assign(sourceMeta, {
            xMinMax: {},
            yMinMax: {},
            xDataSpan: {},
            yDataSpan: {},
        });

        this.resetData(dataOptions, source);
        this.initEffect(globalCtx, source, sourceMeta);
    }

    resetData(dataOptions, source) {
        // console.log('resetData');
        const s = dataOptions.series;
        const reference = dataOptions.reference;
        // let stackMode = false;

        // const dataSource = [];
        const dataLegend = [];
        // // console.log(s);
        const ref = s[0].values.map(v => v[0]);
        s.forEach(({ name }) => {
            dataLegend.push({
                name,
                disabled: false,
            });
        });

        // if (stack) {

        // } else {
        //     s.forEach(({ name, values }) => {
        //         dataSource.push(values);
        //         dataLegend.push({
        //             name,
        //             disabled: false,
        //         });
        //     });
        // }

        Object.assign(source, {
            // data: cloneDeep(dataSource),
            originSeries: dataOptions.series,
            legend: cloneDeep(dataLegend),
            reference: Object.assign({
                ref,
                type: REFERENCE_TYPE.continuous,
            }, reference),
            xAxis: dataOptions.xAxis,
            yAxis: dataOptions.yAxis,
            stack: dataOptions.stack,
            // stacks,
        });
    }

    initEffect(globalCtx, source, sourceMeta) {
        globalCtx.effect(() => {
            // console.log('data init effect');
            const {
                // data,
                originSeries,
                legend,
                xAxis,
                yAxis,
                stack,
            } = source;
            const dataSource = [];
            const valueReducer = [];
            originSeries.forEach(({ values }, idx) => {
                if (stack) {
                    const lastValue = [];
                    const isLgDisabled = legend[idx].disabled;
                    values.forEach((value, idx) => {
                        if (!valueReducer[idx]) {
                            valueReducer[idx] = [ value[0], new BigNumber(0) ];
                        }
                        lastValue[idx] = [ valueReducer[idx][0], +valueReducer[idx][1] ];
                        valueReducer[idx][1] = valueReducer[idx][1].plus(isLgDisabled ? 0 : +value[1]);
                    });
                    dataSource.push(valueReducer.map((v, i) => [ v[0], +v[1], lastValue[i][1], +values[i][1] ]));
                } else {
                    dataSource.push(values);
                }
            });
            // stackdata.forEach(({ values }) => {
            //     const lastValue = [];
            //     values.forEach((value, idx) => {

            //         if (!valueReducer[idx]) {
            //             valueReducer[idx] = [ value[0], new BigNumber(0) ];
            //         }
            //         lastValue[idx] = [ valueReducer[idx][0], +valueReducer[idx][1] ];
            //         valueReducer[idx][1] = valueReducer[idx][1].plus(+value[1]);
            //     });

            //     dataSource.push(valueReducer.map((v, i) => [ v[0], +v[1], lastValue[i][1], +values[i][1] ]));
            // });
            // Object.values(stacks).forEach(stackdata => {

            // });

            const xSpan = xAxis.span || 5;
            const ySpan = yAxis.span || 3;
            let xmin = typeof xAxis.min === 'number' ? xAxis.min : Infinity;
            let ymin = typeof yAxis.min === 'number' ? yAxis.min : Infinity;
            let xmax = typeof xAxis.max === 'number' ? xAxis.max : -Infinity;
            let ymax = typeof yAxis.max === 'number' ? yAxis.max : -Infinity;

            legend.forEach((l, i) => {
                if (!l.disabled) {
                    const values = dataSource[i];
                    values.forEach(v => {
                        const y = v[1];
                        const x = v[0];
                        xmin = Math.min(x, xmin);
                        xmax = Math.max(x, xmax);
                        ymin = Math.min(y, ymin);
                        ymax = Math.max(y, ymax);
                    });
                }
            });

            const yrange = rountToRange({ min: ymin, max: ymax }, ySpan);
            const yValues = getYAxis(yrange);
            const xValues = getXAxis(xmin, xmax, xSpan);
            Object.assign(source, {
                data: cloneDeep(dataSource),
            });
            Object.assign(sourceMeta, {
                yMeta: {
                    min: yValues[0],
                    max: yValues[yValues.length - 1],
                    values: yValues,
                    formatter: yAxis.format || (d => d),
                },
                xMeta: {
                    min: xmin,
                    max: xmax,
                    values: xValues,
                    formatter: xAxis.format || (d => d),
                },
            });
        });
    }
}

export default Data2D;
