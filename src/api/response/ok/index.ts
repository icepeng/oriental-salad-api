export function ok(data: any = {}) {
  const res = this;
  data.message = data.message || 'Success';
  return res.status(200).send(data);
}
