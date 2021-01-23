// find index of first non consecutive number in sorted array
export function findException(arr: number[]) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i + 1] - arr[i] !== 1) {
      return i + 1;
    }
  }
  return -1;
}
