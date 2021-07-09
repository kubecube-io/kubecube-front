const localStorage = window.localStorage;

export function setItem(key, value) {
    localStorage.setItem(key, value);
}

export function removeItem(key) {
    localStorage.removeItem(key);
}

export function getItem(key) {
    return localStorage.getItem(key);
}
