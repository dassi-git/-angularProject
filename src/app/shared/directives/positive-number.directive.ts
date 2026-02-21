import { Directive, ElementRef, input, inject } from '@angular/core';

@Directive({
  selector: 'input[appPositiveNumber]',
  host: {
    '(input)': 'onInput()',
    '(blur)': 'onBlur()'
  }
})
export class PositiveNumberDirective {
  readonly min = input(1, { alias: 'appPositiveNumberMin' });

  private readonly elementRef = inject(ElementRef<HTMLInputElement>);

  onInput(): void {
    const inputElement = this.elementRef.nativeElement;
    const digitsOnly = inputElement.value.replace(/[^\d]/g, '');

    if (digitsOnly !== inputElement.value) {
      inputElement.value = digitsOnly;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  onBlur(): void {
    const inputElement = this.elementRef.nativeElement;
    if (!inputElement.value) {
      return;
    }

    const value = Number(inputElement.value);
    if (!Number.isFinite(value) || value < this.min()) {
      inputElement.value = String(this.min());
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
