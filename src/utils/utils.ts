import { CONFIG_SHOW, SESSION_STORAGE_KEY } from "@/constant";
import parsePhoneNumberFromString from "libphonenumber-js";
import { get } from "lodash";
import { parse } from "qs";

export function getNotificationBody(body: LooseObject) {
    let result = `<div style="color: #f0f0f0">`
    for (const property in body) {
        if (body.hasOwnProperty(property)) {
            if (body[property]) {
                result += `${body[property]}`
            }
        }
    }
    result += `</div>`
    return result;
}


// 根据CONFIG_SHOW的属性值获取Object的属性值。
export function getValueByConfig<T extends Object, K extends keyof CONFIG_SHOW>(obj: LooseObject, key: string) {
    if (!key) {
        return null;
    }
    const T_key = get(CONFIG_SHOW, [key]);
    if (Array.isArray(T_key)) {
        let result = null;
        for (const item in T_key) {
            const value = get(obj, T_key[item]);
            if (['string', 'number', 'bigint'].includes(typeof value)) {
                result = result && value ? result + ' ' + value : result || value;
            }
            continue;
        }
        return result;
    }
    return get(obj, T_key);
}

/**
 * 获取CRM系统的URL
 * @param contact 联系人信息
 * @param dashboard 是否取CRM主页URL
 */
export function getUrlByContact(contact?: LooseObject, dashboard?: boolean) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
    if (dashboard) {
        return tokenInfo?.instance_url;
    }
    return contact?.Id ? tokenInfo?.instance_url + "/" + contact.Id
        : tokenInfo?.instance_url + "/lightning/o/Contact/new";
}

export function formatDescription(str: string, params: any) {
    const regex = /\[([a-zA-Z]+)\]/g;
    return str?.replace(regex, (match: string, capture) => {
        return get(params, capture) || ''
    });
}

export const setToken = () => {
    const search = window.location.search;
    const tokenInfo = parse(decodeURIComponent(search).replace("?", ''));
    return tokenInfo;
}


export const startWithHttpsReg = /^(https?:\/\/)\s*/ // 判断是否http开头,支持ipv6
export function testStartWithHttps(value: string) {
    return value && startWithHttpsReg.test(value)
}

/**
 * 检查是否以https开头，若不是在首位补全
 */
export function checkServerAddress(serverAddr: string) {
    const protocol = 'https://'
    let serverAddress = serverAddr.trim()
    serverAddress = serverAddress.replace(/\/+$/g, '').toLowerCase()

    if (!testStartWithHttps(serverAddress)) {
        serverAddress = `${protocol}${serverAddr}`
    }

    return serverAddress
}

export const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    // 使用 libphonenumber 解析电话号码
    const parsedPhoneNumber = parsePhoneNumberFromString(phone);
    if (parsedPhoneNumber) {
        // 获取格式化后的号码
        return parsedPhoneNumber.formatInternational();
    } else {
        // 如果解析失败，返回原始号码
        return phone;
    }
}