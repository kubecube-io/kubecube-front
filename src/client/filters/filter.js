import dateFormat from '@micro-app/common/base/date.js';

const filter = {
    // 日期精确到当天最早时间并转换为时间戳
    getFirstTime(time) {
        if (!time)
            return '';
        time = time.replace(/-/g, '/');
        const date = new Date(time);
        time = date.getTime();
        return time;
    },
    // 日期精确到当天最晚时间并转换为时间戳
    getLastTime(time) {
        if (!time)
            return '';
        time = time.replace(/-/g, '/');
        time += ' 23:59:59';
        const date = new Date(time);
        time = date.getTime();
        return time;
    },
    // 日期转换为时间戳，10位
    getTimeStampTen(time) {
        if (!time)
            return '';
        time = time.replace(/-/g, '/');
        time = time.replace(/T/g, ' ');
        const date = new Date(time);
        time = Math.round(date.getTime() / 1000);
        return time;
    },
    // 日期转换为时间戳
    getTimeStamp(time) {
        if (!time)
            return '';
        time = time.replace(/-/g, '/');
        time = time.replace(/T/g, ' ');
        const date = new Date(time);
        time = date.getTime();
        return time;
    },
    // 获取一个星期之前的时间
    getOneWeekBefore(time) {
        const myDate = new Date(time.toString().length === 13 ? (parseInt(time) - 7 * 24 * 60 * 60 * 1000) : (parseInt(time * 1000) - 7 * 24 * 60 * 60 * 1000));
        const year = myDate.getFullYear();
        const month = this.get2Length(myDate.getMonth() + 1);
        const date = this.get2Length(myDate.getDate());
        return year + '-' + month + '-' + date;
    },
    // 时间戳转换成日期，精确到天
    timeToDay(time) {
        const myDate = new Date(time.toString().length === 13 ? parseInt(time) : parseInt(time * 1000));
        const year = myDate.getFullYear();
        const month = (myDate.getMonth() + 1) < 10 ? '0' + (myDate.getMonth() + 1) : (myDate.getMonth() + 1);
        const date = (myDate.getDate()) < 10 ? '0' + (myDate.getDate()) : (myDate.getDate());
        return year + '-' + month + '-' + date;
    },
    // 时间戳差换算成年月日、时分秒
    timeDistance(time) {
        let min, hour, day, month, year;
        if (time < (1000 * 60))
            return Math.floor(time / 1000) + '秒';
        else if ((min = time / (1000 * 60)) < 60)
            return Math.floor(min) + '分' + Math.floor((time % 60000) / 1000) + '秒';
        else if ((hour = min / 60) < 24)
            return Math.floor(hour) + '小时' + Math.floor(min % 60) + '分';
        else if ((day = hour / 24) < 30)
            return Math.floor(day) + '天' + Math.floor(hour % 24) + '小时';
        else if ((month = day / 30) < 12)
            return Math.floor(month) + '月' + Math.floor(month % 30) + '天';
        else if ((year = month / 12) >= 1)
            return Math.floor(year) + '年' + Math.floor(month % 12) + '月';
    },
    get2Length(num) {
        if (num < 10)
            return '0' + num;
        else
            return num.toString();
    },
    smartDateFormat(date) {
        if (!date)
            return '-';
        const time = new Date(date).getTime();
        return dateFormat(time, 'YYYY-MM-DD HH:mm:ss');
    },
    smartTime(date) {
        if (!date)
            return '-';
        const time = new Date(date).getTime();
        return dateFormat(time, 'YYYY-MM-DD HH:mm:ss ms');
    },
    // 获取当前年份
    getYear(time) {
        const myDate = new Date(dateFormat(parseInt(time), 'YYYY-MM-DD'));
        const year = myDate.getFullYear();
        return year;
    },
    unitFormat(unit) {
        const map = {
            second: '秒',
            minute: '分钟',
            hour: '时',
            day: '天',
        };
        return map[unit];
    },

    // 负载均衡的均衡策略
    balancePolicy(unit) {
        const map = {
            ROUND_ROBIN: '轮询',
            WEIGHTED_RESPONSE_TIME: '响应时间加权',
            RANDOM: '随机',
            AVAILABILITY_FILTERING: '可用性过滤',
            BEST_AVAILABLE: '最大可用',
            SESSION_STICKY: '会话粘连',
        };
        return map[unit];
    },

    // 路由规则的匹配条件
    routerType(type) {
        const map = {
            SERVICE_NAME: '服务名',
            SERVICE_NAME_VERSION: '服务名 + 版本',
            INSTANCE_NAME: '实例名',
            INSTANCE_IP: '实例IP',
            TAG: "标签",
            SERVICE_NAME_TAG: '服务 + 标签'
        };
        return map[type];
    },
    getFullTime(d) {
        return d.getFullYear() + '' + (d.getMonth() + 1) + '' + d.getDate() + '' + d.getHours() + '' + d.getMinutes() + '' + d.getSeconds();
    },
    // dubbo的降级状态
    dubboMocked(type) {
        const map = {
            FAIL: '已容错',
            NO: '未降级',
            FORCE: '已屏蔽',
        };
        return map[type];
    },
    // dubbo提供者列表的检查
    errorLevel(type) {
        const map = {
            ERROR: '出错',
            WARN: '警告',
            OK: '正常',
        };
        return map[type];
    },
};

export default filter;
