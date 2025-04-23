export const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "");
};
