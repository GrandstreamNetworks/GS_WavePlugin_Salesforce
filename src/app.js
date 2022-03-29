export const dva = {
    config: {
        onError(e) {
            e.preventDefault();
            console.error("onerror", e);
        },
    },
};