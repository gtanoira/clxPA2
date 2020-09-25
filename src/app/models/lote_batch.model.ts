export interface LoteBatchModel {
  id: number;
  idProceso: string;
  tipoProceso: string;
  descripcion: string;
  altaUser?: string;
  altaDate?: string;
  importe?: number;
  moneda?: string;
}
