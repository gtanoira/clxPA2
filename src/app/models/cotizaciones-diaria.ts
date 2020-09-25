export interface CotizacionesDiariaModel {
  monedaOrigen: string;
  monedaDestino: string;
  tipoCotizacion?: string | null;
  valorCotizacion: string;
  rateType?: string | null;
  fechaCotizacion?: string | null;
  valor?: number | null;
}
