import { Injectable, signal } from '@angular/core';

export type CatalogNavContext = {
    // “desde dónde venía el usuario”
    categoryId: string | null;

    // opcional para futuro (búsqueda / filtros)
    q?: string | null;
    // filters?: Record<string, any>;
};

const STORAGE_KEY = 'catalog_nav_context_v1';

@Injectable({ providedIn: 'root' })
export class NavigationContextService {

    // estado en memoria (reactivo)
    readonly context = signal<CatalogNavContext>(this.load());

    // ============
    // setters
    // ============
    setCategory(categoryId: string | null): void {
        this.patch({ categoryId });
    }

    setQuery(q: string | null): void {
        this.patch({ q });
    }

    clear(): void {
        this.context.set({ categoryId: null, q: null });
        this.save(this.context());
    }

    // ============
    // getters
    // ============
    getCategory(): string | null {
        return this.context().categoryId ?? null;
    }

    getQuery(): string | null {
        return this.context().q ?? null;
    }

    // ============
    // internals
    // ============
    private patch(partial: Partial<CatalogNavContext>): void {
        const next = { ...this.context(), ...partial };
        this.context.set(next);
        this.save(next);
    }

    private load(): CatalogNavContext {
        try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return { categoryId: null, q: null };
        const parsed = JSON.parse(raw);

        // “sanitizado” mínimo por si viene basura
        return {
            categoryId: typeof parsed?.categoryId === 'string' ? parsed.categoryId : null,
            q: typeof parsed?.q === 'string' ? parsed.q : null
        };
        } catch {
        return { categoryId: null, q: null };
        }
    }

    private save(value: CatalogNavContext): void {
        try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } catch {
        // si el storage falla (modo incógnito / quota), no rompemos la app
        }
    }
}