import { Directive, HostListener, EventEmitter, Output } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, tap, filter } from 'rxjs/operators';

@Directive({
  selector: '[appHoldable]'
})
export class HoldableDirective {

  // Definir parametros
  @Output() holdTime: EventEmitter<number> = new EventEmitter();

  // Definir variables
  private state: Subject<string> = new Subject();
  private cancel: Observable<string>;

  constructor() {

   this.cancel = this.state.pipe(
      filter(v => v === 'cancel'),
      tap(v => {
        console.log('%c stopped hold', 'color: #ec6969; font-weight: bold;');
        this.holdTime.emit(0);
      })
    );
  }

  // Stop clicking the mouse or the mouse leave the field
  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  onExit() {
    this.state.next('cancel');
  }

  // Click on the button
  @HostListener('mousedown', ['$event'])
  onHold() {
    console.log('%c started hold', 'color: #5fba7d; font-weight: bold;');

    this.state.next('start');
    const n = 0.5;
    interval(n).pipe(
      takeUntil(this.cancel),
      tap(v => {
        if ( (v * n) < 101) {
          this.holdTime.emit(v * n);
        } else {
          this.state.next('cancel');
        }
      }),
    ).subscribe();
  }

}
