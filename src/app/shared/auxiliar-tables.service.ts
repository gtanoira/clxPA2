import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Models
import { SelectOption } from 'src/app/models/select-option';

// Services
import { ErrorMessageService } from '../core/error-message.service';

@Injectable({providedIn: 'root'})
export class AuxiliarTablesService {

  constructor(
    private http: HttpClient,
    private errorMessageService: ErrorMessageService
  ) { }

  // Leer un archivo y devolverlo a quien lo pidió
  public getTableFromJson(tableName: string): Observable<any[]> {
    return this.http.get<any[]>(`/assets/files/${tableName}`);
  }

  // Establecer las Opciones de un campo (INPUT) a través de un archivo Json
  public getOptionsFromJsonFile(fileName: string): Observable<SelectOption[]> {
    return this.getTableFromJson(fileName).pipe(
      map(
        data => {
          return <SelectOption[]>data;
        }
      ),
      catchError(
        err => {
          this.errorMessageService.changeErrorMessage(
            `API-0035(E): error al leer el archivo: ${fileName} - ${err}`);
          return [];
          }
      )
    );
  }

  // Leer los parámetros específicos de un reporte
  public getReportDefaults(fileName: string)  {
    return this.getTableFromJson(fileName)
      .pipe(
        tap(
          data => data
        ),
        catchError(
          err => {
            this.errorMessageService.changeErrorMessage(
              `API-0035(E): error al leer el archivo ${fileName} / Error: ${err}`);
            return of({});
            }
        )
      );
  }

}
