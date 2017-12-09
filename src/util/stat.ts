export function calculateStats(arr: number[]) {
  const len = arr.length;
  const mean = arr.reduce((sum, x) => sum + x, 0) / len;
  const stdev =
    len > 1
      ? Math.sqrt(
          arr.reduce((sum, x) => sum + (x - mean) * (x - mean)) / (len - 1),
        )
      : 0;
  const scoreCount = arr.reduce(
    (obj, x) => {
      return {
        ...obj,
        [x]: obj[x] + 1,
      };
    },
    {
      20: 0,
      30: 0,
      40: 0,
      50: 0,
      60: 0,
      70: 0,
      80: 0,
    },
  );
  return { mean, stdev, ...scoreCount };
}
