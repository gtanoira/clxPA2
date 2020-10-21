export interface ProductLocalPriceModel {
  id: number;
  fecha: string;
  country: string;
  currency: string;
  duration?: number | 0;
  taxableAmount?: number | 0;
}
