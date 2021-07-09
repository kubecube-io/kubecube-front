// import styles from 'cloud-ui.vusion/src/base/global.css?variables';
// const colors = Array(20).fill(1).map((_, i) => styles[`theme-chart-color${i + 1}`]);
// console.log(colors);
import { maxBy } from 'lodash';
export function format(value, type) {
    if (!value) return;
    const fix = str => {
        str = '' + (String(str) || '');
        return str.length <= 1 ? '0' + str : str;
    };
    const maps = {
        yyyy(date) { return date.getFullYear(); },
        MM(date) { return fix(date.getMonth() + 1); },
        dd(date) { return fix(date.getDate()); },
        HH(date) { return fix(date.getHours()); },
        mm(date) { return fix(date.getMinutes()); },
        ss(date) { return fix(date.getSeconds()); },
    };
    const trunk = new RegExp(Object.keys(maps).join('|'), 'g');
    type = type || 'yyyy-MM-dd HH:mm';
    if (typeof value === 'string') value = value.replace(/-/g, '/');
    value = new Date(value);
    if (value.toString() === 'Invalid Date') return;
    return type.replace(trunk, capture => (maps[capture] ? maps[capture](value) : ''));
}

export const resolveLegend = (legendTemplate, metrics) => {

    return {
        type: 'scroll',
        data: metrics.map(m => ({
            name: legendTemplate(m),
            icon: 'rect',
        })),
        bottom: 10,
        itemWidth: 5,
        itemHeight: 5,
    };
};


export const getAxis = (datas, unit) => {
    // const showDate = datas[0][0][0] ? new Date().toDateString() !== new Date(datas[0][0][0] * 1000).toDateString() : false;
    // const xData = datas[0].map(i => format(i[0] * 1000, showDate ? 'MM-dd HH:mm' : 'HH:mm'));
    return {
        yAxis: {
            type: 'value',
            splitNumber: 4,
            axisLabel: {
                formatter(value) {
                    return new Intl.NumberFormat('en-GB', { notation: 'compact', compactDisplay: 'short' }).format(value);
                },
            },
            nameGap: 5,
            name: unit,
        },
        xAxis: {
            type: 'time',
            // data: xData,
            nameTextStyle: {
                width: '20',
            },
            splitLine: {
                show: false,
            },

        },
    };
};

export const getSeries = (chartType, datas, metrics, legendTemplate, step) => {
    return datas.map((d, idx) => {
        const p = [];
        const currMetric = metrics[idx];
        d.forEach((data, idx) => {
            if (idx > 0) {
                const prev = d[idx - 1];
                if (data[0] - prev[0] > step) p.push(null);
            }
            p.push(data);
        });
        return {
            type: chartType,
            smooth: true,
            name: legendTemplate(currMetric),
            data: p.map(i => i && ([ i[0] * 1000, (+i[1]).toFixed(3) ])),
            symbol: 'none',
            areaStyle: {
                opacity: 0.1,
            },
        };
    });
};


const styles = {
    'theme-chart-color1': 'rgb(103, 170, 245)',
    'theme-chart-rgba-color1': 'rgba(103, 170, 245, 0.1)',

    'theme-chart-color2': 'rgb(255, 174, 60)',
    'theme-chart-rgba-color2': 'rgba(255, 174, 60, 0.1)',

    'theme-chart-color3': 'rgb(78, 201, 171)',
    'theme-chart-rgba-color3': 'rgba(78, 201, 171, 0.1)',

    'theme-chart-color4': 'rgb(245, 131, 122)',
    'theme-chart-rgba-color4': 'rgba(245, 131, 122, 0.1)',

    'theme-chart-color5': 'rgb(158, 156, 246)',
    'theme-chart-rgba-color5': 'rgba(158, 156, 246, 0.1)',

    'theme-chart-color6': 'rgb(30, 192, 216)',
    'theme-chart-rgba-color6': 'rgba(30, 192, 216, 0.1)',

    'theme-chart-color7': 'rgb(138, 205, 78)',
    'theme-chart-rgba-color7': 'rgba(138, 205, 78, 0.1)',

    'theme-chart-color8': 'rgb(237, 139, 204)',
    'theme-chart-rgba-color8': 'rgba(237, 139, 204, 0.1)',

    'theme-chart-color9': 'rgb(135, 206, 232)',
    'theme-chart-rgba-color9': 'rgba(135, 206, 232, 0.1)',

    'theme-chart-color10': 'rgb(97, 218, 198)',
    'theme-chart-rgba-color10': 'rgba(97, 218, 198, 0.1)',

    'theme-chart-color11': 'rgb(198, 156, 246)',
    'theme-chart-rgba-color11': 'rgba(198, 156, 246, 0.6)',

    'theme-chart-color12': 'rgb(137, 170, 247)',
    'theme-chart-rgba-color12': 'rgba(137, 170, 247, 0.6)',

    'theme-chart-color13': 'rgb(251, 155, 108)',
    'theme-chart-rgba-color13': 'rgba(251, 155, 108, 0.6)',

    'theme-chart-color14': 'rgb(103, 170, 245)',
    'theme-chart-rgba-color14': 'rgba(103, 170, 245, 0.6)',

    'theme-chart-color15': 'rgb(134, 187, 231)',
    'theme-chart-rgba-color15': 'rgba(134, 187, 231, 0.6)',

    'theme-chart-color16': 'rgb(245, 196, 80)',
    'theme-chart-rgba-color16': 'rgba(245, 196, 80, 0.6)',

    'theme-chart-color17': 'rgb(135, 206, 232)',
    'theme-chart-rgba-color17': 'rgba(135, 206, 232, 0.6)',

    'theme-chart-color18': 'rgb(239, 216, 22)',
    'theme-chart-rgba-color18': 'rgba(239, 216, 22, 0.6)',

    'theme-chart-color19': 'rgb(92, 208, 133)',
    'theme-chart-rgba-color19': 'rgba(92, 208, 133, 0.6)',

    'theme-chart-color20': 'rgb(241, 126, 248)',
    'theme-chart-rgba-color20': 'rgba(241, 126, 248, 0.6)',
};

export const colorvariables = Array(20).fill(1).map((_, i) => `theme-chart-color${i + 1}`);


export const resolveTableLegend = (datas, metric, metrics) => {
    const { legendFunc } = metric;
    const l = maxBy(datas, d => {
        const i = d.length - 1;
        return d[i][0];
    });
    const maxTime = l[l.length - 1][0];
    // console.log(maxTime)
    // return metrics.filter((_, idx) => {
    //     const data = datas[idx];
    //     const l = data.length - 1;
    //     return data[l][0] === maxTime;
    // })
    return metrics.map((m, idx) => {
        const data = datas[idx];
        const l = data.length - 1;
        return {
            name: legendFunc(m),
            data: (data[l][0] === maxTime ? (+data[l][1]).toFixed(2) : 0),
            color: styles[`theme-chart-color${idx + 1}`],
            icon: 'rect',
        };
    });
};
