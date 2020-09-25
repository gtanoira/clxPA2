import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelExporterService {

  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'data': worksheet },
      SheetNames: ['data']
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    // const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  // Descarga un archivo excel con 2 solapas: "comprobantes" y "alicuotas"
  // Esta rutina se usa para el Citi Ventas
  public exportMultiSheets(json: any, excelFileName: string): void {

    const worksheetCbtes: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json['comprobantes']);
    const worksheetAlicuotas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json['alicuotas']);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'comprobantes': worksheetCbtes, 'alicuotas': worksheetAlicuotas },
      SheetNames: ['comprobantes', 'alicuotas']
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    // const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob(
      [buffer],
      {type: EXCEL_TYPE}
    );
    FileSaver.saveAs(data, fileName + new Date().getTime() + EXCEL_EXTENSION);
  }

}