export interface DetalleReciboModel {
  companiaId: string;
  clienteId: number;
  clienteNombre: string;
  pais: string;
  cobrador: string;
  docContable: string;
  docClase: string;
  docFecha: string;
  docNroSap: string;
  docNroLegal: string;
  monedaMD: string;
  importeMD: number;
  importeUSD: number;
  docCompensacion?: string;
  fechaCompensacion?: string;
}
