export function pTimeout<T>(
  p: Promise<T>,
  ms: number,
  label = "timeout"
): Promise<T> {
  let t: any;
  const to = new Promise<never>((_, reject) => {
    t = setTimeout(() => reject(new Error(label)), ms);
  });
  return Promise.race([p, to]).finally(() => clearTimeout(t)) as Promise<T>;
}
