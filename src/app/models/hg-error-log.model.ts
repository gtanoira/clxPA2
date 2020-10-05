export interface HgErrorLogModel {
  id: number;
  errorType: string;
  message: string;
  timestamp: string;
  errorCode: string;
  errorSolved: number;
  idFk: number;
}
