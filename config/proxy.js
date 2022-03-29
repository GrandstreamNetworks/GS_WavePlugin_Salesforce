export default {
    dev: {
        '/salesforce': {
            target: 'https://grandstream3-dev-ed.my.salesforce.com/',
            changeOrigin: true,
            pathRewrite: {
                '^/salesforce': '',
            },
        },

        '/token': {
            target: 'https://d28000001eo7zeau-dev-ed.my.salesforce.com',
            changeOrigin: true,
            pathRewrite: {
                '^/token': '',
            },
        },
    },
};
