import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PositiveNumberDirective } from '../../shared/directives/positive-number.directive';

@Component({
  selector: 'app-quantity-selector',
  imports: [PositiveNumberDirective],
  template: `
    <input
      type="number"
      appPositiveNumber
      [min]="min()"
      [value]="displayValue()"
      (input)="onInput($event)"
      [disabled]="disabled()"
      class="quantity-input"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuantitySelectorComponent {
  readonly value = input<number>(1);
  readonly min = input<number>(1);
  readonly disabled = input(false);
  readonly valueChanged = output<number>();

  readonly displayValue = computed(() => {
    const currentValue = this.value();
    return Number.isFinite(currentValue) && currentValue >= this.min() ? currentValue : this.min();
  });

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parsedValue = Number(target.value);
    const nextValue = Number.isFinite(parsedValue) && parsedValue >= this.min() ? parsedValue : this.min();
    this.valueChanged.emit(nextValue);
  }
}
