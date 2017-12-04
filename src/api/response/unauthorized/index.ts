export function unauthorized(data: any = {}) {
  const res = this;
  return res.status(401).send(data);
}
