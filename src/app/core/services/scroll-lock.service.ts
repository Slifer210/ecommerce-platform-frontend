import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ScrollLockService {

    private renderer: Renderer2;

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    lock(): void {
        this.renderer.setStyle(document.body, 'overflow', 'hidden');
    }

    unlock(): void {
        this.renderer.removeStyle(document.body, 'overflow');
    }

}