import { ignoredKeys } from 'kubecube/utils/constance';
import cronValidate from 'node-cron/src/pattern-validation';
import YAML from 'yaml';
export const k8sResourceNameValidator = () => {
    return {
        trigger: [ 'blur', 'change' ],
        validator: (rule, value, callback) => {
            const message = '1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾';
            if (value.length === 0 || value.length > 63) {
                callback(new Error(message));
            } else if (!/^[a-z]([0-9a-z\-]*[0-9a-z])?$/.test(value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const k8sResourceNameEnhanceValidator = () => {
    return {
        trigger: [ 'blur', 'change' ],
        validator: (rule, value, callback) => {
            const message = '1-253位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾';
            if (value.length === 0 || value.length > 253) {
                callback(new Error(message));
            } else if (!/^[a-z]([0-9a-z\-]*[0-9a-z])?$/.test(value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofNumberOrPercentage = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator: (rule, value, callback) => {
            if (!required && !value) {
                return callback();
            }
            const message = '应为百分比或整数';
            if (!/^[-+]?([0-9]+\.)?[0-9]+%$/.test(value) && !/^[-+]?[0-9]+$/.test(value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofNumber = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator: (rule, value, callback) => {
            if (!required && !value) {
                return callback();
            }
            const message = '应为整数';
            if (!/^[0-9]*$/.test(value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const numberBetween = (min = -Infinity, max = Infinity, required, message = '') => {
    return {
        trigger: [ 'blur', 'change' ],
        validator: (rule, value, callback) => {
            if (!required && (value !== 0 && !value)) {
                return callback();
            }
            message = message || (min === -Infinity ? `应小于等于${max}` : '') || (max === Infinity ? `应大于等于${min}` : '') || `范围在${min}-${max}之间`;
            if (+(value) > +(max) || +(value) < +(min)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofFloatNumber = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '数字格式有误';
            if (!/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const startsWithSlash = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '以"/"开头';
            if (!/^\//.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofPath = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '仅包含字母，数字，中划线，下划线，"/"和"."';
            if (!/^[a-zA-Z0-9-_/.]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const noRedundance = (list, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '已存在相同项';
            let t = 0;
            list.forEach(p => {
                if (p === value) t++;
            });
            if (t > 1) {
                return callback(new Error(message));
            }
            return callback();
        },
    };
};

export const enhanceNoRedundance = (list, item, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '已存在相同项';
            let t = 0;
            list.forEach(p => {
                if (p === item) t++;
            });
            if (t > 1) {
                return callback(new Error(message));
            }
            return callback();
        },
    };
};

export const consistofSubPath = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '请填入相对路径';
            if (!/^[a-zA-Z0-9-_.][a-zA-Z0-9-_/.]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const startsWithLetter = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '以字母开头';
            if (!/^[a-zA-Z]/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};
export const consistofLetterNumbersUnderscores = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '仅包含字母、数字和下划线';
            if (!/^[a-zA-Z0-9_]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const lengthBetween = (min = -Infinity, max = Infinity, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = `长度不得少于${min}位且不大于${max}位`;
            try {
                const v = `${value}`.length;
                if (v >= min && v <= max) {
                    return callback();
                }
                callback(new Error(message));
            } catch (err) {
                callback(new Error(message));
            }
        },
    };
};

export const consistofUnicode = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '仅包含 unicode';
            if (!/^[\x00-\x7F]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const someValueRequired = (list, needed, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '工作负载至少需要设置一个业务容器';
            if (!list.some(l => l === needed)) {
                return callback(new Error(message));
            }
            return callback();
        },
    };
};

export const startsWithLowercaseLetter = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '以小写字母开头';
            if (!/^[a-z]/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistoLetterNumbersUnderscores = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '仅包含小写字母、数字和中划线';
            if (!/^[a-z0-9-]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const keyPattern = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'key 不合法';
            let prefix = '';
            let suffix = '';
            const spartIndex = value.indexOf('/');
            if (spartIndex !== -1) {
                prefix = value.slice(0, spartIndex);
                suffix = value.slice(spartIndex + 1);
            } else {
                suffix = value;
            }
            if (prefix.length > 253 || suffix.length > 63) {
                callback(new Error(message));
            } else if (!/^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const noSystemKey = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '不能使用系统标签';
            if (ignoredKeys.some(item => value.startsWith(item))) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const required = (message = '不能为空') => {
    return {
        trigger: [ 'blur', 'change' ],
        required: true,
        message,
    };
};

export const labelValuePatten = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '1-63位字母、数字、"-"、"_"或"."组成，以字母或数字开头、结尾';
            const l = `${value}`.length;
            if (!(l >= 1 && l <= 63 && /^(([a-zA-Z0-9][a-zA-Z0-9-_]*\.)*[a-zA-Z0-9]*[a-zA-Z0-9-_]*[[a-zA-Z0-9]+\/)?(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/.test(value || ''))) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const multipartLabelValuePatten = (spliter = /\s/, required, message) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const arr = (value || '').split(spliter);
            message = message || '1-63位字母、数字、"-"、"_"或"."组成，以字母或数字开头、结尾，多个以空格分隔';
            const result = arr.map(item => {
                const l = `${item}`.length;
                if (!(l >= 1 && l <= 63 && /^(([a-zA-Z0-9][a-zA-Z0-9-_]*\.)*[a-zA-Z0-9]*[a-zA-Z0-9-_]*[[a-zA-Z0-9]+\/)?(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/.test(item || ''))) {
                    return false;
                }
                return true;

            });
            if (result.some(r => !r)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const linuxCronPattern = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Linux Cron表达式不合法';
            try {
                cronValidate(value);
                callback();
            } catch (err) {
                callback(new Error(message));
            }
        },
    };
};

export const fixedFieldNum = (length, separator, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = `由${length}个被“${separator}”分隔的字段组成`;
            if (value && value.split(separator).length === length) {
                callback();
            } else {
                callback(new Error(message));
            }
        },
    };
};

export const startsWithLowercaseLetterOrNumber = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '以小写字母或数字开头';
            if (!/^[a-z0-9]/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofLowercaseLetterNumbersUnderscores = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '仅包含小写字母、数字和下划线';
            if (!/^[a-z0-9_]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const endsWithLowercaseLetterOrNumber = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '以小写字母或数字结尾';
            if (!/[a-z0-9]$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const numberBiggerThen = (min = -Infinity, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && (value !== 0 && !value)) {
                return callback();
            }
            const message = `应大于${min}`;
            const v = +(value);
            if (v <= min) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const someRequired = (list = [], required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '必须填一个';
            if (!list.some(l => l)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const arrayRequired = (filterkey = '') => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!filterkey) {
                callback();
            }
            const filter = Array.isArray(filterkey) ?
                v => filterkey.every(k => !!v[k]) :
                v => !!v[filterkey];
            const message = '必须填一个';
            if (Array.isArray(value) && value.filter(filter).length > 0) {
                callback();
            } else {
                callback(new Error(message));
            }
        },
    };
};

export const cookie = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'cookie字符不合法';
            if (!/^[a-zA-Z0-9_-]{0,1024}$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofNormalSymbol = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = "仅包含数字、字母、'-'、 '_' 或'.'";
            if (!/^[\w-.]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const email = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '邮箱格式有误';
            if (!/^[\w.]+@\w+\.[a-z]{2,3}(\.[a-z]{2,3})?$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const nameExistence = (list = [], required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '名称已存在';
            if (list.find(l => l === value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const yaml = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'yaml 格式错误';
            try {
                YAML.parse(value);
                callback();
            } catch (error) {
                callback(new Error(message));
            }
        },
    };
};

export const ingressSuffix = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '请输入合法的 ingress 后缀';
            if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const greateThenEqual = (nim, message, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && (value !== 0 && !value)) {
                return callback();
            }
            nim = +(nim);
            message = message || `应大于等于${nim}`;
            if (+(value) < nim) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const greateThen = (nim, message, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && (value !== 0 && !value)) {
                return callback();
            }
            nim = +(nim);
            message = message || `应大于${nim}`;
            if (+(value) <= nim) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const lessThenEqual = (max, message, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && (value !== 0 && !value)) {
                return callback();
            }
            max = +(max);
            message = message || `应小于等于${max}`;
            if (+(value) > max) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const clusterDisplayName = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '1-100字符，以中文、字母、数字开头或结尾，支持下划线、中划线';
            if (!/^([\u4e00-\u9fa5a-zA-Z0-9][\u4e00-\u9fa5a-zA-Z0-9_-]{0,98})?[\u4e00-\u9fa5a-zA-Z0-9]$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const cidr = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'CIDR 不合法';
            if (!/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([1-2][0-9]|3[0-2]|[0-9]))$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const urlpattern = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'URL不合法';
            try {
                new URL(value);
                callback();
            } catch (err) {
                callback(new Error(message));
            }
        },
    };
};
