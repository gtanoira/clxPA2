export interface MktExpenditureModel {
  id: number;
  anioMes: string;
  canal: string;
  fuente: string;
  medio: string;
  pais: string;
  campania?: string;
  localMoneda: string;
  localImporte: number;
  usdMoneda: string;
  usdImporte: number;
}
