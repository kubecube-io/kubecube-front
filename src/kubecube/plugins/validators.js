import {
    validate,
} from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import { ignoredKeys } from 'kubecube/utils/constance';
import cronValidate from 'node-cron/src/pattern-validation';

export const rules = {
    required: {
        ...required,
        message: '必填项',
    },
    arrayRequired: {
        params: [ 'filterkey' ],
        validate: (v, { filterkey }) => {
            if (!filterkey) return true;
            const filter = Array.isArray(filterkey) ?
                v => filterkey.every(k => !!v[k]) :
                v => !!v[filterkey];
            return Array.isArray(v) && v.filter(filter).length > 0;
        },
        message: '必填项',
    },
    Cookie: {
        validate: v => /^[-!#$%&'*+.`|~^\w]*$/.test(v),
        message: 'cookie字符不合法',
    },

    startsWithLowercaseLetter: {
        validate: v => /^[a-z]/.test(v || ''),
        message: '以小写字母开头',
    },
    startsWithSlash: {
        validate: v => /^\//.test(v || ''),
        message: '以"/"开头',
    },
    endsWithSlash: {
        validate: v => /\/$/.test(v || ''),
        message: '以"/"结尾',
    },
    startsWithLetter: {
        validate: v => /^[a-zA-Z]/.test(v || ''),
        message: '以字母开头',
    },
    startsWithLetterOrNumber: {
        validate: v => /^[a-zA-Z0-9]/.test(v || ''),
        message: '以字母或数字开头',
    },
    startsWithLowercaseLetterOrNumber: {
        validate: v => /^[a-z0-9]/.test(v || ''),
        message: '以小写字母或数字开头',
    },
    endsWithLowercaseLetterOrNumber: {
        validate: v => /[a-z0-9]$/.test(v || ''),
        message: '以小写字母或数字结尾',
    },
    ConsistoLetterNumbersUnderscores: {
        validate: v => /^[a-z0-9-]*$/.test(v || ''),
        message: '仅包含小写字母、数字和中划线',
    },

    ConsistofLowercaseLetterNumbersUnderscores: {
        validate: v => /^[a-z0-9-]*$/.test(v || ''),
        message: '仅包含小写字母、数字和下划线',
    },
    ConsistofLetterNumbersUnderscores: {
        validate: v => /^[a-zA-Z0-9-]*$/.test(v || ''),
        message: '仅包含字母、数字和下划线',
    },
    ConsistofPath: {
        validate: v => /^[a-zA-Z0-9-_/.]*$/.test(v || ''),
        message: '仅包含字母，数字，中划线，下划线，"/"和"."',
    },
    ConsistofSubPath: {
        validate: v => /^[a-zA-Z0-9-_.][a-zA-Z0-9-_/.]*$/.test(v || ''),
        message: '请填入相对路径',
    },
    ConsistofNumber: {
        validate: v => /^[0-9]*$/.test(v || ''),
        message: '仅包含数字',
    },
    ConsistofFloatNumber: {
        validate: v => /^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/.test(v || ''),
        message: '数字格式有误',
    },
    ConsistofNumberOrPercentage: {
        validate: v => /^[-+]?[0-9.]+%?$/.test(v || ''),
        message: '仅包含百分比或整数',
    },
    ConsistofNormalSymbol: {
        validate: v => /^[\w-.]*$/.test(v || ''),
        message: "仅包含数字、字母、'-'、 '_' 或'.'组成",
    },

    numberOrPercentage: {
        validate: v => /^\d+%?$/.test(v || ''),
        message: '仅包含数字或百分比',
    },

    phone: {
        validate: v => /^1([38][0-9]|14[579]|5[^4]|16[6]|7[1-35-8]|9[189])\d{8}$/.test(v || ''),
        message: '手机号格式有误',
    },

    userPassword: {
        validate: v => /(?!^\d+$)(?!^[A-Za-z]+$)(?!^[^A-Za-z0-9]+$)(?!^.*[\u4E00-\u9FA5].*$)^\S{8,20}$/.test(v),
        message: '密码需包含字母、数字和特殊字符两种及以上组合',
    },

    password: {
        validate: v => /^.{5,17}$/.test(v || ''),
        message: '以字母开头，5-17位',
    },

    email: {
        validate: v => /^[\w.]+@\w+\.[a-z]{2,3}(\.[a-z]{2,3})?$/.test(v || ''),
        message: '邮箱格式有误',
    },

    ConsistofUnicode: {
        // eslint-disable-next-line
        validate: v => /^[\x00-\x7F]*$/.test(v || ''),
        message: '仅包含 unicode',
    },

    K8SLabelValuePatten: {
        validate: v => /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/.test(v || ''),
        message: 'K8S label 不合法',
    },

    KeyPattern: {
        validate: v => /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/.test(v),
        message: 'key 不合法',
    },

    noSystemKey: {
        validate: v => !ignoredKeys.some(item => v.startsWith(item)),
        message: '不能使用系统标签',
    },

    LabelValuePatten: {
        validate: v => /^(([a-zA-Z0-9][a-zA-Z0-9-_]*\.)*[a-zA-Z0-9]*[a-zA-Z0-9-_]*[[a-zA-Z0-9]+\/)?(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/.test(v || ''),
        message: '1-63位字母、数字、"-"、"_"或"."组成，以字母或数字开头、结尾',
    },

    cidr: {
        validate: v => /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([1-2][0-9]|3[0-2]|[0-9]))$/.test(v || ''),
        message: 'CIDR 不合法',
    },

    ip: {
        validate: v => /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v || ''),
        message: 'IP 不合法',
    },

    dependOnPattern: {
        params: [ 'depend' ],
        validate: (value, { depend }) => {
            if (!depend && depend !== 0) return false;
            return true;
        },
    },

    noRedundance: {
        params: [ 'list' ],
        validate: (value, { list }) => {
            let t = 0;
            list.forEach(p => {
                if (p === value) t++;
            });
            if (t > 1) {
                return false;
            }
            return true;
        },
        message: '已存在相同项',
    },

    existence: {
        params: [ 'list' ],
        validate: (value, { list }) => {
            return !list.some(l => l === value);
        },
        message: '已存在相同项',
    },

    multipart: {
        params: [ 'rule', 'spliter' ],
        validate: async (value, { rule, spliter }) => {
            const arr = (value || '').split(spliter);
            try {
                const promises = arr.map(p => validate(p, rule));
                const result = await Promise.all(promises);
                return result.every(r => r.valid);
            } catch (err) {
                return false;
            }
        },
        message: (field, params) => {
            return rules[params.rule].message;
        },
    },

    lengthBetween: {
        params: [ 'min', 'max' ],
        validate: async (value, { min = -Infinity, max = Infinity }) => {
            try {
                const v = `${value}`.length;
                return v >= min && v <= max;
            } catch (err) {
                return false;
            }
        },
        message: (field, params) => {
            return `长度不得少于${params.min}位且不大于${params.max}位`;
        },
    },

    NumberBiggerThen: {
        params: [ 'min' ],
        validate: async (value, { min = -Infinity }) => {
            try {
                const v = +(value);
                return v > min;
            } catch (err) {
                return false;
            }
        },
        message: (field, params) => {
            return `应大于${params.min}`;
        },
    },

    NumberBetween: {
        params: [ 'min', 'max' ],
        validate: async (value, { min = -Infinity, max = Infinity }) => {
            try {
                const v = +(value);
                return v >= min && v <= max;
            } catch (err) {
                return false;
            }
        },
        message: (field, params) => {
            return `范围在${params.min}-${params.max}之间`;
        },
    },
    someRequired: {
        params: [ 'list' ],
        validate: (value, { list }) => {
            return list.some(l => l);
        },
        message: '必须填一个',
    },

    someValueRequired: {
        params: [ 'list', 'needed' ],
        validate: (value, { list, needed }) => {
            return list.some(l => l === needed);
        },
        message: '工作负载至少需要设置一个业务容器',
    },

    sameAs: {
        params: [ 'target', 'key' ],
        validate: (value, { target }) => {
            return value === target;
        },
        message: (field, params) => {
            return `两次输入的${params.key}不一致`;
        },
    },

    linuxCronPattern: {
        validate: value => {
            try {
                cronValidate(value);
                return true;
            } catch (err) {
                return false;
            }
        },
        message: '表达式不合法',
    },

    urlpattern: {
        validate: value => {
            try {
                new URL(value);
                return true;
            } catch (err) {
                return false;
            }
        },
        message: 'URL不合法',
    },
};
