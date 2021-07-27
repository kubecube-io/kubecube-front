export function userInterceptor(instance) {

    instance.interceptors.response.use(function(response) {
        const { status, headers } = response;
        if (status === 200) {
            if (headers['content-length'] !== 0 && headers['content-type'] && headers['content-type'].startsWith('application/json')) {
                return response.data;
            }
            return response;
        }
        return response;
    }, function(error) {
        return Promise.reject(error);
    });
}
