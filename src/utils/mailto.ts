export function buildMailto(to: string[], subject: string, body: string, cc: string[] = []) {
  const recipients = to.filter(value => /^[^\s@,;?]+@[^\s@,;?]+\.[^\s@,;?]+$/.test(value));
  const build = (text: string, title = subject) => `mailto:${recipients.map(encodeURIComponent).join(',')}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}${cc.length ? `&cc=${encodeURIComponent(cc.join(','))}` : ''}`;
  let text = body, title = subject;
  while (build(text, title).length > 1800 && (text.length || title.length)) {
    if (text.length) text = Array.from(text).slice(0, Math.max(0, Array.from(text).length - 20)).join('');
    else title = Array.from(title).slice(0, Math.max(0, Array.from(title).length - 20)).join('');
  }
  const url = build(text, title);
  if (url.length > 1800) throw new Error('Recipient list is too long for an email-app link.');
  return { url, truncated: text !== body || title !== subject };
}
