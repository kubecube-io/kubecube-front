import Service from './service';

import { userInterceptor } from './interceptor';
const userService = Service({
    baseURL: '/api/v1/cube/',
    apis: {
        login: {
            url: '/login',
            method: 'post',  
        },
        getUserList: {
            url: '/user',
            method: 'get', 
            withCredentials: true, 
        },
        createUser: {
            url: '/user',
            method: 'post',  
            withCredentials: true,
        },
        modifyUser: {
            template: '/user/{user}',
            method: 'post',
            withCredentials: true,
        },
        getUserTemplate: {
            url: '/user/getImportTemplate',
            method: 'get',
            responseType: 'blob',
            headers: {
                'Accept': 'application/octet-stream'
            },
        },
        batchCreateUser: {
            url: '/user/createUserByCsv',
            method: 'post',
        }
        
    }
});

userInterceptor(userService.axiosInstance);

export default userService;
/* 
export async function login(data){
    return await userService.request({
        url: '/login',
        method: 'post',  
        data,
    });
}

export async function getUserList(params) {
    return await userService.request({
        url: '/user',
        method: 'get',
        params,
        withCredentials: true,
    });
}

export async function createUser(data) {
    return await userService.request({
        url: '/user',
        method: 'post',
        data,
        withCredentials: true,
    });
}

export async function modifyUser(user, data) {
    return await userService.request({
        url: `/user/${user}`,
        method: 'put',
        data,
        withCredentials: true,
    });
}

export async function getUserTemplate() {
    const response = await userService.request({
        url: '/user/getImportTemplate',
        method: 'get',
        responseType: 'blob',
        headers: {
            'Accept': 'application/octet-stream'
        }
    });
    jsFileDownload(response.data, 'UserTemplate.csv');  
}

export async function batchCreateUser(data) {
    return await userService.request({
        url: '/user/createUserByCsv',
        method: 'post',
        data,
    });
}*/