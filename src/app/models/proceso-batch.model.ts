export interface ProcesoBatchModel {
  id: number;
  altaDate: string;
  tabla: string;
  resultado?: string;
  idFk: number;
  ultimoTimestampLote: string;
  altaUser: string;
}
