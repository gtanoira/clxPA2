import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// External libraries
import * as moment from 'moment';

// Models
import { SelectOption } from 'src/app/models/select-option';

// Services
import { AuxiliarTablesService } from 'src/app/shared/auxiliar-tables.service';
import { ErrorMessageService } from 'src/app/core/error-message.service';
import { ExcelExporterService } from 'src/app/shared/excel_exporter.service';
import { SapService } from 'src/app/shared/sap.service';

@Component({
  selector: 'app-subdiario',
  templateUrl: './subdiarios.component.html',
  styleUrls: ['./subdiarios.component.css']
})
export class SubdiariosComponent implements OnInit {

  // Definir variables
  tiposDocOptions: SelectOption[];
  tiposDocInitial = [];
  companyOptions: SelectOption[];
  companySelected: string;
  othersHeight = '';  // height in pixels of all other components
  formData: FormGroup;

  // Variables para Holdable Button bar
  public color = 'warn';
  public holdableButtonMs = 0;
  public isFetching = false;  // se utiliza para mostrar el spinner

  // Definir array para exportar a Excel
  dataToExcel = [];

  constructor(
    private fb: FormBuilder,
    private auxiliarTablesService: AuxiliarTablesService,
    private errorMessageService: ErrorMessageService,
    private excelExporterService: ExcelExporterService,
    private sapService: SapService
  ) {

    // Definir FORM
    this.formData = this.fb.group({
      fechaDesde: [
        moment().subtract(1, 'M').startOf('month'),
        [Validators.required]
      ],
      fechaHasta: [
        moment().subtract(1, 'M').endOf('month'),
        [Validators.required]
      ],
      tiposDoc: [
        ''
      ],
      companyId: [
        '',
        [Validators.required]
      ]
    });
  }

  ngOnInit() {

    // Company Options
    this.auxiliarTablesService.getOptionsFromJsonFile('subdiario_compras_company_options.json')
      .subscribe(
        data => {
          this.companyOptions = data;
          this.companySelected = this.companyOptions[0].id;
        }
      );
    // Tipos de Doc Options
    this.auxiliarTablesService.getOptionsFromJsonFile('subdiario_compras_tipos_doc_options.json')
      .subscribe(
        data => {
          this.tiposDocOptions = data;
          // Setear inicialmente el campo tiposDoc para el FORM
          const auxTipos = [];
          for (const elem of this.tiposDocOptions) {
            auxTipos.push(elem.id);
          }
          this.formData.controls.tiposDoc.setValue(auxTipos);
          this.tiposDocInitial = auxTipos;
        }
      );
  }

  /*
     GETTERS:convenience getter for easy access to form fields
  */
  get companyId() { return this.formData.get('companyId'); }
  get fechaDesde() { return this.formData.get('fechaDesde'); }
  get fechaHasta() { return this.formData.get('fechaHasta'); }
  get tiposDoc() { return this.formData.get('tiposDoc'); }

  // Confirmar botón ACTUALIZAR
  public holdHandler(e) {

    // Chequear si hay que actualizar la cotización al mantener apretado el botón por más de 1 segundo
    this.holdableButtonMs = e;
    if (e > 100) {
      // Mas de 1 segundo apretado el botón
      this.color = 'primary';

      // Procesar el botón
      if (!this.isFetching) {
        this.getReport();
      }

    } else {
      // No se llegó al segundo
      this.color = 'warn';
    }
  }

  // Obtener el reporte y habilitar los botones de descarga a Excel
  getReport() {

    // Borrar la linea de mensajes de error
    this.errorMessageService.changeErrorMessage('');

    // Ocultar botón Reporte SAP
    this.isFetching = true;  // activar Loading spinner

    // Ocultar el botón Exportar a Excel
    this.dataToExcel = [];

    this.sapService.getSubdiarioCompras(
      this.companyId.value,
      this.fechaDesde.value.format('YYYYMMDD'),
      this.fechaHasta.value.format('YYYYMMDD'),
      this.tiposDoc.value
    ).subscribe(
      data => {
        if (data.length <= 0) {
          // tslint:disable-next-line: max-line-length
          this.errorMessageService.changeErrorMessage('API-0004(E): no se encontró ningun registro que cumpla con los filtros establecidos.');
        } else {
          this.dataToExcel = this.convertSapData(data);
          this.errorMessageService.changeErrorMessage('Reporte generado con éxito');
        }
        this.isFetching = false;
      },
      err => {
        this.errorMessageService.changeErrorMessage(err);
        this.isFetching = false;
      }
    );

  }

  // Convertir el JSON enviado por el SAP-GW en el JSON para el subdiario
  private convertSapData(data: any) {

    const regExpCbteNro = '([0-9]{4,5})([A-Z]{1})([0-9]+)';
    let cbteNroSuc = '';
    let cbteNroLetra = '';
    let cbteNro = '';
    const outputReport = [];
    let elementReport: {};
    const arrayData = data;
    // Iterar sobre cada documento y convertir los datos necesarios
    for (let i = 0; i < arrayData.length; i++) {

      // Procesar el detalle
      const detalles = arrayData[i]['detalle'];
      // Inicializar totalizadores
      let socIva_27 = 0, socIva_21 = 0, socIva_10_5 = 0, socIva_2_5 = 0;
      let socBiIva_27 = 0, socBiIva_21 = 0, socBiIva_10_5 = 0, socBiIva_2_5 = 0;
      let percepcionIva = 0, percepcionGanancias = 0, percepcionIiBb = 0;
      let otrosImpuestos = 0, totExento = 0, totImportaciones = 0, totGravado = 0;
      // Iterar sobre los detalles y procesar cada registro
      for (const detalle of detalles) {
        if (detalle['sn_iva'] === 'S') {
          socIva_27 += detalle['soc_iva_27'];
          socBiIva_27 += detalle['soc_bi_iva_27'];
          socIva_21 += detalle['soc_iva_21'];
          socBiIva_21 += detalle['soc_bi_iva_21'];
          socIva_10_5 += detalle['soc_iva_10_5'];
          socBiIva_10_5 += detalle['soc_bi_iva_10_5'];
          socIva_2_5 += detalle['soc_iva_2_5'];
          socBiIva_2_5 += detalle['soc_bi_iva_2_5'];
        }
        if (detalle['sn_importaciones'] === 'S') { totImportaciones += detalle['soc_importe']; }
        if (detalle['sn_otros_impuestos'] === 'S') { otrosImpuestos += detalle['soc_importe']; }
        if (detalle['sn_perc_ganancias'] === 'S') { percepcionGanancias += detalle['soc_importe']; }
        if (detalle['sn_perc_iibb'] === 'S') { percepcionIiBb += detalle['soc_importe']; }
        if (detalle['sn_perc_iva'] === 'S') { percepcionIva += detalle['soc_importe']; }
        if (detalle['sn_tot_exento'] === 'S') { totExento += detalle['soc_importe']; }
        if (detalle['sn_tot_gravado'] === 'S') { totGravado += detalle['soc_importe']; }
      }

      /*
      // Calular el total Gravado
      const totGravado = this.calcularTotGravado(socBiIva_27, socBiIva_21, socBiIva_10_5, socBiIva_2_5);
      // Chequear que el total gravado no esté incluído en el total exento
      if (totGravado === totExento) {
        totExento = 0;
      }
      */

      // Armar el registro
      const comprobante = arrayData[i]['cbte_nro'].trim().match(regExpCbteNro);
      if (comprobante !== null) {
        cbteNroSuc = comprobante[1];
        cbteNroLetra = comprobante[2];
        cbteNro = comprobante[3];
      } else {
        cbteNroSuc = '';
        cbteNroLetra = '';
        cbteNro = '';
      }
      elementReport = {
        nro_cbte_ctble: arrayData[i]['nro_cbte_ctble'],
        empresa_id: arrayData[i]['empresa_id'],
        anio_ctble: arrayData[i]['anio_ctble'],
        fecha_ctble: moment(arrayData[i]['fecha_ctble'], 'YYYYMMDD').format('DD/MM/YYYY'),
        proveedor_id: arrayData[i]['proveedor_id'],
        razon_social: arrayData[i]['razon_social'],
        comprobante: arrayData[i]['cbte_nro'],
        cbte_tipo: arrayData[i]['cbte_tipo'],
        cbte_suc: cbteNroSuc,
        cbte_letra: cbteNroLetra,
        cbte_nro: cbteNro,
        doc_tipo_id: arrayData[i]['doc_tipo_id'],
        doc_tipo_desc: arrayData[i]['doc_tipo_desc'],
        doc_tipo_nro: arrayData[i]['doc_nro'],
        resp_iva_desc: arrayData[i]['resp_iva_desc'],
        clase_doc: arrayData[i]['clase_doc'],
        fecha_cbte: arrayData[i]['fecha_cbte'],
        doc_moneda_id: arrayData[i]['doc_moneda_id'],
        doc_tot_bruto: arrayData[i]['doc_tot_bruto'],
        soc_moneda_id: arrayData[i]['soc_moneda_id'],
        soc_tot_bruto: arrayData[i]['soc_tot_bruto'],
      };

      // Agregar los datos calculados del detalle a elementReport{}
      elementReport['tot_neto'] = totGravado;
      if (arrayData[i]['resp_iva_desc'].toUpperCase() === 'MONOTRIBUTO') {
        elementReport['tot_monotributo'] = totExento;
        elementReport['tot_exento'] = 0;
      } else {
        elementReport['tot_monotributo'] = 0;
        elementReport['tot_exento'] = totExento;
      }
      elementReport['tot_importaciones'] = totImportaciones;
      elementReport['percepcion_IIBB'] = percepcionIiBb;
      elementReport['percepcion_iva'] = percepcionIva;
      elementReport['otros_impuestos'] = otrosImpuestos;
      elementReport['percepcion_ganancias'] = percepcionGanancias;
      elementReport['cant_items_iva'] = arrayData[i]['cant_items_iva'],
      elementReport['NG_21'] = socBiIva_21;
      elementReport['iva_21'] = socIva_21;
      elementReport['NG_10_5'] = socBiIva_10_5;
      elementReport['iva_10_5'] = socIva_10_5;
      elementReport['NG_27'] = socBiIva_27;
      elementReport['iva_27'] = socIva_27;
      elementReport['NG_2_5'] = socBiIva_2_5;
      elementReport['iva_2_5'] = socIva_2_5;

      // Agregar elementReport al outputReport
      outputReport.push(elementReport);
    }
    return outputReport;
  }

  calcularTotGravado(biIva27: number, biIva21: number, biIva10_5: number, biIva2_5: number): number {
    let totGravado = 0;
    // IVA 27%
    if (   biIva27 !== 0
        && biIva27 !== biIva21
        && biIva27 !== biIva10_5
        && biIva27 !== biIva2_5) {
      totGravado += biIva27;
    }
    // IVA 21%
    if (   biIva21 !== 0
        && biIva21 !== biIva27
        && biIva21 !== biIva10_5
        && biIva21 !== biIva2_5) {
      totGravado += biIva21;
    }
    // IVA 10,5%
    if (   biIva10_5 !== 0
        && biIva10_5 !== biIva27
        && biIva10_5 !== biIva21
        && biIva10_5 !== biIva2_5) {
      totGravado += biIva10_5;
    }
    // IVA 2,5%
    if (   biIva2_5 !== 0
      && biIva2_5 !== biIva27
      && biIva2_5 !== biIva21
      && biIva2_5 !== biIva10_5) {
      totGravado += biIva2_5;
    }

    return totGravado;
  }

  // Botón Exportar a Excel
  exportExcel() {
    this.excelExporterService.exportAsExcelFile(
      this.dataToExcel,
      `subdiario_compras_${this.fechaDesde.value.format('YYYYMM')}_`);
  }
}



