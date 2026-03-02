export const environment = {
    production: false,

    // BACKEND LOCAL (desarrollo)
    apiUrl: 'http://localhost:8080',

    // Base API (se usa con proxy)
    apiBase: '/api',

    // OAuth Google
    googleAuthUrl: 'http://localhost:8080/oauth2/authorization/google',

    cloudinary: {
        cloudName: 'dv7jhcs8z',
        uploadPreset: 'ecommerce'
    }
};