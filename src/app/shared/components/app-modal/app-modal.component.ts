import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-modal.component.html'
})
export class AppModalComponent implements OnChanges {

  @Input() open = false;
  @Input() width = '900px';

  @Output() close = new EventEmitter<void>();

  visible = false;
  closing = false;

  ngOnChanges(changes: SimpleChanges) {

    if (changes['open']) {

      if (this.open) {
        this.visible = true;
        this.closing = false;
      } else if (this.visible) {
        this.startCloseAnimation();
      }

    }
  }

  onClose() {
    this.startCloseAnimation();
  }

  startCloseAnimation() {

    this.closing = true;

    setTimeout(() => {
      this.visible = false;
      this.closing = false;
      this.close.emit();
    }, 180);

  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.visible) {
      this.startCloseAnimation();
    }
  }

}