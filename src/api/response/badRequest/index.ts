export function badRequest(data: any = {}) {
  const res = this;
  return res.status(400).send(data);
}
