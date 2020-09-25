import { NgModule } from '@angular/core';

// Directives
import { HoldableDirective } from 'src/app/shared/directives/holdable.directive';
import { OnlyNumbersDirective } from 'src/app/shared/directives/only-numbers.directive';

@NgModule({
  declarations: [
    // Directives
    HoldableDirective,
    OnlyNumbersDirective
  ],
  exports: [
    // Directives
    HoldableDirective,
    OnlyNumbersDirective
  ]
})
export class DirectivesModule {}
