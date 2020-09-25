/*
  Sort any array by multiple fields in asc or desc order
  Usage:
    arraySort(myArray, ['clientId', '-dateDoc'])

  @arrayData: an array of objects [ {...}, {...}, ... ]
  @fieldsToSort: an array of strings representing the fields inside the objects {...} to sort.
                 if a field has a minus sign as prefix, the order is DESCending
  @return the same array sorted.
*/
export function arraySort(arrayData: any[], fieldsToSort: string[]): any[] {

  const fieldSorter = (fields) => (a, b) => fields.map(
    o => {
      let dir = 1;
      if (o[0] === '-') {
        dir = -1;
        o = o.substring(1);
      }
      return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
    }
  ).reduce((p, n) => p ? p : n, 0);

  return arrayData.sort(fieldSorter(fieldsToSort));
}

