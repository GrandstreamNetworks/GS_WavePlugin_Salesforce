const DEVELOP_USER_CONFIG = {
    host: 'https://grandstream4-dev-ed.my.salesforce.com/',
    grant_type: 'password',
    client_id:
        '3MVG9pRzvMkjMb6ka7zDuRRC1BcZUe5fDwuCXuPKO1Oi.HffMmco3kVxV0yHYTdW86xovWXmRaBgkBqBU2sCX',
    client_secret:
        '84D92A60E23397EDB98FA5D3EB674E61CC5352DA1C1D81617DAEA958E9D35208',
};

export const LOGIN_CONFIG = {
    response_type: 'code',
    prompt: 'login',
    client_id:
        '3MVG9pRzvMkjMb6ka7zDuRRC1BcZUe5fDwuCXuPKO1Oi.HffMmco3kVxV0yHYTdW86xovWXmRaBgkBqBU2sCX',
    redirect_uri: 'https://grandstream4-dev-ed.lightning.force.com/',
}

const DATE_FORMAT = {
    format_1: 'YYYY/MM/DD',
    format_2: 'YYYY-MM-DD HH-mm-ss',
    format_3: 'YYYY/MM/DD HH/mm/ss',
    format_4: 'HH:mm:ss',
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

const DEFAULT_DOMAIN = 'https://login.salesforce.com';

const SESSION_STORAGE_KEY = {
    domain: 'domain',
    tokenInfo: 'tokenInfo',
    version_uri: 'version_uri',
    rememberMe: 'rememberMe',
}

const EVENT_KEY = {
    recvP2PIncomingCall: 'onRecvP2PIncomingCall', // 收到来电
    answerP2PCall: 'onAnswerP2PCall', // 接听来电
    hangupP2PCall: 'onHangupP2PCall', // 挂断来电
    rejectP2PCall: 'onRejectP2PCall', // 拒接来电
    initP2PCall: 'onInitP2PCall', // wave发去呼叫
    p2PCallCanceled: 'onP2PCallCanceled', // 未接来电、去电
    initPluginWindowOk: 'onInitPluginWindowOk', //初始化窗口成功
    onViewCustomerInfos: 'onViewCustomerInfos' // 收到客户信息
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
    first: 'Information 1',
    second: 'Information 2',
    third: 'Information 3',
    forth: 'Information 4',
    fifth: 'Information 5'
}

const NOTIFICATION_CONFIG_DEF = {
    first: 'Name',
    second: 'Phone',
    third: 'None',
    forth: 'None',
    fifth: 'None',
}

const AUTO_CREATE_CONFIG_DEF = {
    numberType: 'Wave',
    direction: 'All',
    entityType: 'Contact',
    firstName: 'Wave [Number]',
    lastName: 'New',
}

const UPLOAD_CALL_CONFIG_DEF = {
    subject: 'Wave PhoneSystem Call',
    Inbound: '[DateTime]: Incoming call from [Number] [Name] to [Agent]([Duration])',
    Missed: '[DateTime]: Missed call from [Number] [Name] to [Agent]',
    Outbound: '[DateTime]: Outgoing call from [Agent] to [Number] [Name] ([Duration])',
    unansweredOutbound: '[DateTime]: Unanswered outgoing call from [Agent] to [Number] [Name]'
}

const CREATION_CONFIG_CONTACT_TYPE = [
    'Contact', 'Account'
]

export {
    DEFAULT_DOMAIN,
    AUTO_CREATE_CONFIG_DEF, CONFIG_SHOW, CREATION_CONFIG_CONTACT_TYPE, DATE_FORMAT, DEVELOP_USER_CONFIG, EVENT_KEY, GLOBAL_MESSAGE, NOTIFICATION_CONFIG_DEF, NotificationConfig, REQUEST_CODE,
    SESSION_STORAGE_KEY, UPLOAD_CALL_CONFIG_DEF, WAVE_CALL_TYPE
};

