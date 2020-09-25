export interface OpenItemModel {
  companiaId: string;
  clienteId: string;
  docFecha: string;
  tipoDoc: string;
  docNumero: string;
  docCompensacion: string;
  mesServicio: string;
  docContable: string;
  refFactura: string;
  refKey1: string;
  monedaId: string;
  socMonId: string;
  docImporte: number;
  socImporte: number;
  refFact2?: string;
}

export class CrearOpenItem implements OpenItemModel {
  companiaId: string;
  clienteId: string;
  docFecha: string;
  tipoDoc: string;
  docNumero: string;
  docCompensacion: string;
  mesServicio: string;
  docContable: string;
  refFactura: string;
  refKey1: string;
  monedaId: string;
  socMonId: string;
  docImporte: number;
  socImporte: number;
  refFact2?: string;

  constructor (
    companiaId?: string | '',
    clienteId?: string | '',
    docFecha?: string | '',
    tipoDoc?: string | '',
    docNumero?: string | '',
    docCompensacion?: string | '',
    mesServicio?: string | '',
    docContable?: string | '',
    refFactura?: string | '',
    refKey1?: string | '',
    monedaId?: string | '',
    socMonId?: string | '',
    docImporte?: number | 0,
    socImporte?: number | 0,
    refFact2?: string | ''
  ) {
    this.companiaId = companiaId;
    this.clienteId = clienteId;
    this.docFecha = docFecha;
    this.tipoDoc = tipoDoc;
    this.docNumero = docNumero;
    this.docCompensacion = docCompensacion;
    this.mesServicio = mesServicio;
    this.docContable = docContable;
    this.refFactura = refFactura;
    this.refKey1 = refKey1;
    this.monedaId = monedaId;
    this.socMonId = socMonId;
    this.docImporte = docImporte;
    this.socImporte = socImporte;
    this.refFact2 = refFact2;
  }
}

