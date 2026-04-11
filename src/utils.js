export function SvgStringToImg(svg_string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg_string)}`;
}
