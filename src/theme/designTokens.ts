export type PolityColorToken =
  | "--polity-coral"
  | "--polity-crimson"
  | "--polity-rose"
  | "--polity-purple"
  | "--polity-violet"
  | "--polity-indigo"
  | "--polity-blue"
  | "--polity-sky"
  | "--polity-cyan"
  | "--polity-teal"
  | "--polity-emerald"
  | "--polity-lime"
  | "--polity-amber"
  | "--polity-gold"
  | "--polity-terracotta"
  | "--polity-magenta";

export function getTokenColor(tokenName: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(tokenName)
    .trim();
  return value || "rgb(59, 130, 246)";
}
