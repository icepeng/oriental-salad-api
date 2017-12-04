export function notFound(data: any = {}) {
  const res = this;
  return res.status(404).send(data);
}
