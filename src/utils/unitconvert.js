export const weiToEth = (wei) => {
  return ((Number(wei) / 1) * 10 ** 18).toString();
};

export const weiToGwei = (wei) => {
  return ((Number(wei) / 1) * 10 ** 9).toString();
};

export const ethToInr = (eth) => {
  let n = eth * 216523;
  return Number(n).toFixed(2);
};
