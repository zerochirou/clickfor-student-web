export function dateNow() {
  const date = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  } as const;

  return date.toLocaleDateString("en-GB", options);
}
