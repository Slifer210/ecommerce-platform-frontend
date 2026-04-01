// Request: POST /api/auth/login
export interface LoginRequest {
    email: string;
    password: string;
}

// Response: LoginResponse(token)
export interface LoginResponse {
    token: string;
}

// Request: POST /api/auth/register
export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    captchaToken: string;
}

export interface PasswordResetRequest {
    email: string;
    captchaToken: string;
}

// Response: GET /api/auth/me
export interface MeResponse {
    id: string;              
    email: string;
    roles: string[];
    emailVerified: boolean;
    profileImageUrl: string | null;
    profileCompleted: boolean;
}


// Response: GET /api/auth/verify
export interface VerifyEmailResponse {
    message: string;
    token: string;
}
