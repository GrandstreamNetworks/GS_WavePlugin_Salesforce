import { stringify } from 'qs';
import { SESSION_STORAGE_KEY } from '@/constant';
import request from '@/utils/request';

/**
 * 获取联系人列表
 * @param params
 * @returns
 */
export function getQueryList(params: LooseObject) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/query?${stringify(params)}`);
}

export function getSearchList(callNum: string) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/parameterizedSearch?q=${callNum}&sobject=Account&sobject=Contact&sobject=Lead`);
}

export function getFullInfo(url: string) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    return request(`${tokenInfo.instance_url}${url}?t=${new Date().getTime()}`);
}

/**
 * 查询联系人By id
 * @param id
 */
export function getContactById(id: string) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/sobjects/Contact/${id}?t=${new Date().getTime()}`);
}

/**
 * get Account By id
 * @param id
 */
export function getAccountById(id: string) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/sobjects/Account/${id}?t=${new Date().getTime()}`);
}

/**
 * get Lead By id
 * @param id
 */
export function getLeadById(id: string) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/sobjects/Lead/${id}?t=${new Date().getTime()}`);
}

/**
 * 创建联系人
 * @param params
 */
export function createContact(params: LooseObject) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/sobjects/Contact`, {
        method: 'POST',
        body: JSON.stringify(params),
    })
}

/**
 * 创建Lead
 * @param params
 */
export function createLead(params: LooseObject) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/sobjects/Lead`, {
        method: 'POST',
        body: JSON.stringify(params),
    })
}

/**
 * 创建Account
 * @param params
 */
export function createAccount(params: LooseObject) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/sobjects/Account`, {
        method: 'POST',
        body: JSON.stringify(params),
    })
}

/**
 * 上报通话记录
 * @returns {*}
 * @param params
 */
export function putCallInfo(params: LooseObject) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/sobjects/Task`, {
        method: 'POST',
        body: JSON.stringify(params)
    })
}
