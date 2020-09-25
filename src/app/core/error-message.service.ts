// This components is for print error messages on the screen
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ErrorMessageService {

  // FORM messages
  private formMessageSubject = new BehaviorSubject('');
  public formCurrentMessage = this.formMessageSubject.asObservable();

  // Program Title
  private _appProgramTitle = new BehaviorSubject('');
  currentProgramTitle = this._appProgramTitle.asObservable();

  constructor() { }

  changeErrorMessage(message: string) {
    this.formMessageSubject.next(message);
  }

  // Emit a new program title on the screen
  changeAppProgramTitle(programTitle: string) {
    this._appProgramTitle.next(programTitle);
  }

}
