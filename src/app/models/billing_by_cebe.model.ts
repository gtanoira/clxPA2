export interface BillingByCeBeModel {
  companyId: string;
  clienteId: string;
  clienteDesc: string;
  tipoContrato: string;
  moneda: string;
  paisId: string;
  montoBase: number;
  ctoRepPorc: number;
  netoFacturado: number;
  totCostoRepresentada: number;
  observaciones: string;
}
