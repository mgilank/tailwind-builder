const COLOR_NAMES = [
  'slate','gray','zinc','neutral','stone','red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose'
];

const SHADE_VALUES = ['50','100','200','300','400','500','600','700','800','900'];

type Token = string;

function tokenize(classes: string): Token[] {
  return classes.trim().split(/\s+/).filter(Boolean);
}

function detokenize(tokens: Token[]): string {
  return tokens.join(' ').trim();
}

function replaceTokens(classes: string, patterns: RegExp[], add?: string): string {
  let tokens = tokenize(classes).filter((t) => !patterns.some((re) => re.test(t)));
  if (add && add.length) tokens.push(add);
  return detokenize(tokens);
}

export function applyMarginClass(classes: string, value: string | ''): string {
  // value examples: '', '0','1','2','3','4','6','8','12','16'
  const add = value ? `m-${value}` : undefined;
  return replaceTokens(classes, [/^m-(.+)$/], add);
}

export function currentMarginValue(classes: string): string | '' {
  const t = tokenize(classes).find((t) => /^m-(.+)$/.test(t));
  if (!t) return '';
  const m = t.match(/^m-(.+)$/);
  return (m?.[1] as string) || '';
}

export function applyPaddingClass(classes: string, value: string | ''): string {
  const add = value ? `p-${value}` : undefined;
  return replaceTokens(classes, [/^p-(.+)$/], add);
}

export function currentPaddingValue(classes: string): string | '' {
  const t = tokenize(classes).find((t) => /^p-(.+)$/.test(t));
  if (!t) return '';
  const m = t.match(/^p-(.+)$/);
  return (m?.[1] as string) || '';
}

function colorPattern(prefix: 'text' | 'bg'): RegExp[] {
  const names = COLOR_NAMES.join('|');
  // Matches: text-blue-600, text-white, text-black
  const withShade = new RegExp(`^${prefix}-(?:${names})-(?:[1-9]00|50)$`);
  const simple = new RegExp(`^${prefix}-(?:white|black)$`);
  return [withShade, simple];
}

export const DEFAULT_TEXT_SHADE = '600';
export const DEFAULT_BG_SHADE = '100';

export function applyTextColor(classes: string, color?: string, shade?: string): string {
  let add: string | undefined;
  if (color && shade) {
    add = `text-${color}-${shade}`;
  } else if (color && (color === 'white' || color === 'black')) {
    add = `text-${color}`;
  } else if (color) {
    // default shade when a color is chosen without a shade
    add = `text-${color}-${DEFAULT_TEXT_SHADE}`;
  }
  return replaceTokens(classes, [...colorPattern('text'), arbitraryColorPattern('text')], add);
}

export function currentTextColor(classes: string): { color: string | '', shade: string | '' } {
  const token = tokenize(classes).find((t) => colorPattern('text').some((re) => re.test(t)));
  if (!token) return { color: '', shade: '' };
  const m = token.match(/^text-([a-z]+)(?:-(\d{2,3}))?$/);
  return { color: (m?.[1] as any) ?? '', shade: (m?.[2] as any) ?? '' };
}

export function applyBgColor(classes: string, color?: string, shade?: string): string {
  let add: string | undefined;
  if (color && shade) {
    add = `bg-${color}-${shade}`;
  } else if (color && (color === 'white' || color === 'black')) {
    add = `bg-${color}`;
  } else if (color) {
    // default shade when a color is chosen without a shade
    add = `bg-${color}-${DEFAULT_BG_SHADE}`;
  }
  return replaceTokens(classes, [...colorPattern('bg'), arbitraryColorPattern('bg')], add);
}

export function currentBgColor(classes: string): { color: string | '', shade: string | '' } {
  const token = tokenize(classes).find((t) => colorPattern('bg').some((re) => re.test(t)));
  if (!token) return { color: '', shade: '' };
  const m = token.match(/^bg-([a-z]+)(?:-(\d{2,3}))?$/);
  return { color: (m?.[1] as any) ?? '', shade: (m?.[2] as any) ?? '' };
}

export const COLOR_NAMES_UI = ['','slate','gray','zinc','neutral','stone','red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose','white','black'];
export const SHADE_VALUES_UI = ['','50','100','200','300','400','500','600','700','800','900'];

export const SPACING_VALUES_UI = ['','0','0.5','1','1.5','2','2.5','3','3.5','4','5','6','8','10','12','16','20','24'];

// Arbitrary color helpers (only match color-like values, not sizes like text-[32px])
function arbitraryColorPattern(prefix: 'text' | 'bg'): RegExp {
  // Supported: hex (#rgb, #rrggbb, #rrggbbaa), rgb()/rgba(), hsl()/hsla()
  const inner = '(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\\([^\\]]+\\)|hsla?\\([^\\]]+\\))';
  return new RegExp(`^${prefix}-\\[(${inner})\\]$`);
}

export function applyTextColorArbitrary(classes: string, hex?: string): string {
  const add = hex && hex.length ? `text-[${hex}]` : undefined;
  return replaceTokens(classes, [...colorPattern('text'), arbitraryColorPattern('text')], add);
}

export function applyBgColorArbitrary(classes: string, hex?: string): string {
  const add = hex && hex.length ? `bg-[${hex}]` : undefined;
  return replaceTokens(classes, [...colorPattern('bg'), arbitraryColorPattern('bg')], add);
}

export function currentTextArbitrary(classes: string): string | '' {
  const t = tokenize(classes).find((t) => arbitraryColorPattern('text').test(t));
  if (!t) return '';
  const m = t.match(arbitraryColorPattern('text'));
  return (m?.[1] as string) || '';
}

export function currentBgArbitrary(classes: string): string | '' {
  const t = tokenize(classes).find((t) => arbitraryColorPattern('bg').test(t));
  if (!t) return '';
  const m = t.match(arbitraryColorPattern('bg'));
  return (m?.[1] as string) || '';
}

// Flex direction utilities for sections
const FLEX_DIR_PATTERNS = [/^flex-(row|row-reverse|col|col-reverse)$/];
export type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse';

export function applyFlexDirection(classes: string, dir: FlexDirection): string {
  const add = `flex-${dir}`;
  return replaceTokens(classes, FLEX_DIR_PATTERNS, add);
}

export function currentFlexDirection(classes: string): FlexDirection {
  const token = tokenize(classes).find((t) => FLEX_DIR_PATTERNS.some((re) => re.test(t)));
  if (!token) return 'col';
  const m = token.match(/^flex-(row|row-reverse|col|col-reverse)$/);
  return (m?.[1] as FlexDirection) || 'col';
}
