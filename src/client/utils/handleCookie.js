export default {
    createCookie(name, value, days, domainName) {
        domainName = this.readCookie('qz_domain.name') || domainName;
        let expires;
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        } else
            expires = '';
        document.cookie = name + '=' + escape(value) + expires + '; domain=' + domainName + '; path=/';
    },
    readCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0)
                return unescape(c.substring(nameEQ.length, c.length));
        }
        return null;
    },
    eraseCookie(name, domainName) {
        this.createCookie(name, '', -1, domainName);
    },
    deleteAllCookies(domainName) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            this.eraseCookie(name, domainName);
        }
    },
};
