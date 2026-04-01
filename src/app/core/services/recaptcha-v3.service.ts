import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RecaptchaV3Service {

    private scriptLoadPromise: Promise<void> | null = null;
    private readonly siteKey = environment.recaptcha.siteKey;

    constructor(
        @Inject(DOCUMENT) private document: Document
    ) {}

    async execute(action: string): Promise<string> {
        if (!this.siteKey) {
            throw new Error('RECAPTCHA_SITE_KEY_MISSING');
        }

        await this.loadScript();

        return new Promise<string>((resolve, reject) => {
            const grecaptcha = window.grecaptcha;

            if (!grecaptcha) {
                reject(new Error('RECAPTCHA_UNAVAILABLE'));
                return;
            }

            grecaptcha.ready(() => {
                grecaptcha.execute(this.siteKey, { action })
                    .then((token) => {
                        if (!token) {
                            reject(new Error('RECAPTCHA_TOKEN_EMPTY'));
                            return;
                        }

                        resolve(token);
                    })
                    .catch(() => reject(new Error('RECAPTCHA_EXECUTION_FAILED')));
            });
        });
    }

    private loadScript(): Promise<void> {
        if (window.grecaptcha) {
            return Promise.resolve();
        }

        if (this.scriptLoadPromise) {
            return this.scriptLoadPromise;
        }

        this.scriptLoadPromise = new Promise<void>((resolve, reject) => {
            const existingScript = this.document.getElementById('google-recaptcha-v3');

            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(), { once: true });
                existingScript.addEventListener('error', () => reject(new Error('RECAPTCHA_SCRIPT_LOAD_FAILED')), { once: true });
                return;
            }

            const script = this.document.createElement('script');
            script.id = 'google-recaptcha-v3';
            script.async = true;
            script.defer = true;
            script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(this.siteKey)}`;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('RECAPTCHA_SCRIPT_LOAD_FAILED'));

            const parent = this.document.head ?? this.document.body ?? this.document.documentElement;
            parent.appendChild(script);
        }).catch((error) => {
            this.scriptLoadPromise = null;
            throw error;
        });

        return this.scriptLoadPromise;
    }
}
