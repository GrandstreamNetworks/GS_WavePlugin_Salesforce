import { stringify } from 'qs';
import request from  '@/utils/request';
import { DEVELOP_USER_CONFIG } from '@/constant';

/**
 * 授权
 * @param params {{grant_type, client_id, client_secret, username, password}}
 * @returns
 */
export function getToken(params: LooseObject) {
    return request(`${DEVELOP_USER_CONFIG.host}/services/oauth2/token`,
        {
            method: 'POST',
            body: stringify(params),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        },
    );
}
