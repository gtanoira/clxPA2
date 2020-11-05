export interface PagoPartidaModel {
  empresaId: string;
  proveedorId: string;
  proveedorDesc: string;
  estado: string;
  docNro: string;
  ejercicio: string;
  referencia: string;
  docFecha: string;
  docFechaCtble: string;
  claseDoc: string;
  docMoneda: string;
  docImporte: number;
  socMoneda: string;
  socImporte: number;
  itemPosicion: number;
  itemDesc: string;
  condPago: string;
  vtoFechaBase: string;
  vtoDiasAdic: number;
  vtoFecha: string;
  vtoDesc: string;
  vtoDiasRef: number;
  viaPago: string;
  bloqueo: string;
}
