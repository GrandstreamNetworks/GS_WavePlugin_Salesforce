const DEVELOP_USER_CONFIG = {
    host: 'https://grandstream4-dev-ed.my.salesforce.com/',
    grant_type: 'password',
    client_id:
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    client_secret:
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
};

const DATE_FORMAT = {
    format_1: 'YYYY/MM/DD',
    format_2: 'YYYY-MM-DD hh-mm-ss',
    format_3: 'YYYY/MM/DD hh/mm/ss',
};

const GLOBAL_MESSAGE = {
    timeout: 'global_message_timeout',
    error: 'global_message_error',
    success: 'global_message_success',
    info: 'global_message_info',
    warning: 'global_message_warning',
    duration_0: 0,
    duration_1: 1,
    duration_2: 2,
    duration_3: 3,
    duration_4: 4,
    duration_5: 5,
};

const REQUEST_CODE = {
    ok: 200,
    created: 201,
    deleted: 204,
    dataError: 400,
    noAuthority: 401,
    forbidden: 403,
    noFound: 404,
    serverError: 500,
    gatewayError: 502,
    serverOverload: 503,
    serverTimeout: 504,
    connectError: 'CONNECT_ERROR',
    invalidToken: 'INVALID_TOKEN',
    reConnect: 'RECONNECT',
};

const SESSION_STORAGE_KEY = {
    tokenInfo: 'tokenInfo',
    version_uri: 'version_uri',
}

const EVENT_KEY = {
    recvP2PIncomingCall: 'onRecvP2PIncomingCall', // 收到来电
    answerP2PCall: 'onAnswerP2PCall', // 接听来电
    hangupP2PCall: 'onHangupP2PCall', // 挂断来电
    rejectP2PCall: 'onRejectP2PCall', // 拒接来电
    initP2PCall: 'onInitP2PCall', // wave发去呼叫
    p2PCallCanceled: 'onP2PCallCanceled', // 未接来电、去电
    initPluginWindowOk: 'onInitPluginWindowOk', //初始化窗口成功
}

const WAVE_CALL_TYPE = {
    in: 'Inbound',
    out: 'Outbound',
    miss: 'Missed',
}

type CONFIG_SHOW = {
    None: null | undefined
    Name: string,
    Phone: string,
    Fax: string,
    Email: string,
    Industry: string,
    Company: string,
    Title: string,
    Department: string,
    Description: string,
}

const CONFIG_SHOW: CONFIG_SHOW = {
    None: undefined,
    Name: 'Name',
    Phone: "Phone",
    Fax: 'Fax',
    Email: 'Email',
    Industry: 'Industry',
    Company: 'Company',
    Title: 'Title',
    Department: 'Department',
    Description: 'Description',
}

const NotificationConfig = {
    first: 'information 1',
    second: 'information 2',
    third: 'information 3',
    forth: 'information 4',
    fifth: 'information 5'
}

export {
    NotificationConfig,
    CONFIG_SHOW,
    DEVELOP_USER_CONFIG,
    DATE_FORMAT,
    GLOBAL_MESSAGE,
    REQUEST_CODE,
    SESSION_STORAGE_KEY,
    EVENT_KEY,
    WAVE_CALL_TYPE
};
