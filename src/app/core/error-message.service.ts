// This components is for print error messages on the screen
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ErrorMessageService {

  // Error messages
  // tslint:disable-next-line: variable-name
  private _errorMessageSubject = new BehaviorSubject('');
  public errorMessage = this._errorMessageSubject.asObservable();

  // Program Title
  private _appProgramTitle = new BehaviorSubject('');
  currentProgramTitle = this._appProgramTitle.asObservable();

  // Type of message: alert or info
  public typeOfMessage = 'alert';

  constructor() { }

  // Emit an error message to the screen
  public changeErrorMessage(message: string, type: string = 'alert'): void {
    this.typeOfMessage = type;
    this._errorMessageSubject.next(message);
  }

  // Emit a new program title on the screen
  public changeAppProgramTitle(programTitle: string) {
    this._appProgramTitle.next(programTitle);
  }

}
