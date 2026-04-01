type RuntimeAppConfig = {
    assistantApiUrl?: string;
};

function resolveAssistantApiUrl(): string {
    const runtimeConfig = (globalThis as typeof globalThis & {
        __APP_CONFIG__?: RuntimeAppConfig;
    }).__APP_CONFIG__;

    const configuredUrl = runtimeConfig?.assistantApiUrl?.trim();

    if (configuredUrl) {
        return configuredUrl.replace(/\/+$/, '');
    }

    // Fallback pensado para un proxy/rewrite en produccion sin hardcodear localhost.
    return '/assistant-api';
}

export const environment = {
    production: true,

    apiUrl: 'https://ecommerce-platform-backend-2cwb.onrender.com',
    apiBase:
        'https://ecommerce-platform-backend-2cwb.onrender.com/api',
    assistantApiUrl: resolveAssistantApiUrl(),

    googleAuthUrl:
        'https://ecommerce-platform-backend-2cwb.onrender.com/oauth2/authorization/google',

    recaptcha: {
        siteKey: '6LeVQ48sAAAAAHsderK1Oq5UGbsiyvFrC-H10oLy'
    },

    cloudinary: {
        cloudName: 'dv7jhcs8z',
        uploadPreset: 'ecommerce'
    }
};
