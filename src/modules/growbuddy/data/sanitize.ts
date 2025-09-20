import createDOMPurify, { type DOMPurifyI } from 'dompurify';

import type {
  KnowledgeContentElementTag,
  KnowledgeContentNode,
} from '@/modules/growbuddy/types/knowledge';

const ALLOWED_TAGS: KnowledgeContentElementTag[] = [
  'p',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'code',
  'pre',
  'span',
  'br',
  'h1',
  'h2',
  'h3',
];

const ALLOWED_ATTRIBUTES = ['href', 'title', 'target', 'rel'] as const;

const allowedTagSet = new Set<string>(ALLOWED_TAGS);

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

let domPurifyInstance: DOMPurifyI | null = null;

const getDomPurify = (): DOMPurifyI | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!domPurifyInstance) {
    domPurifyInstance = createDOMPurify(window);
  }

  return domPurifyInstance;
};

const stripDangerousAttributes = (value: string): string =>
  value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, '');

const sanitizeHtmlWithoutDom = (html: string): string =>
  stripDangerousAttributes(html).replace(
    /<\/?([a-z0-9-]+)([^>]*)>/gi,
    (match, tagName: string, attributes: string) => {
      const normalised = tagName.toLowerCase();

      if (!allowedTagSet.has(normalised)) {
        return '';
      }

      if (match.startsWith('</')) {
        return `</${normalised}>`;
      }

      if (normalised === 'br') {
        return '<br />';
      }

      if (normalised === 'a') {
        const safeAttributes: string[] = [];

        const hrefMatch = attributes.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
        if (hrefMatch) {
          const hrefValue = hrefMatch[2] ?? hrefMatch[3] ?? hrefMatch[4] ?? '';
          if (!/^javascript:/i.test(hrefValue.trim())) {
            safeAttributes.push(`href="${hrefValue}"`);
          }
        }

        const titleMatch = attributes.match(/title\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
        if (titleMatch) {
          const titleValue = titleMatch[2] ?? titleMatch[3] ?? titleMatch[4] ?? '';
          safeAttributes.push(`title="${titleValue}"`);
        }

        return `<a${safeAttributes.length > 0 ? ` ${safeAttributes.join(' ')}` : ''}>`;
      }

      return `<${normalised}>`;
    },
  );

const convertInlineFormatting = (value: string): string =>
  value
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(?!\*)(.+?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/_(?!_)(.+?)_(?!_)/g, '<em>$1</em>');

const convertBlockToHtml = (block: string): string => {
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return '';
  }

  const isUnorderedList = lines.every((line) => /^[-*]\s+/.test(line));
  if (isUnorderedList) {
    const items = lines
      .map((line) => line.replace(/^[-*]\s+/, ''))
      .map((line) => convertInlineFormatting(line));

    return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  }

  const isOrderedList = lines.every((line) => /^\d+\.\s+/.test(line));
  if (isOrderedList) {
    const items = lines
      .map((line) => line.replace(/^\d+\.\s+/, ''))
      .map((line) => convertInlineFormatting(line));

    return `<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`;
  }

  const withLineBreaks = block.replace(/\n/g, '<br />');
  const formatted = convertInlineFormatting(withLineBreaks);

  return `<p>${formatted.trim()}</p>`;
};

const convertRawContentToHtml = (raw: string): string => {
  const trimmed = raw.trim();

  if (!trimmed) {
    return '';
  }

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  const blocks = trimmed.split(/\n{2,}/);

  return blocks
    .map((block) => convertBlockToHtml(block))
    .filter((blockHtml) => blockHtml.length > 0)
    .join('');
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));

const extractAnchorAttributes = (raw: string): Record<string, string> | undefined => {
  const attributes: Record<string, string> = {};

  const hrefMatch = raw.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
  if (hrefMatch) {
    const hrefValue = hrefMatch[2] ?? hrefMatch[3] ?? hrefMatch[4] ?? '';
    if (!/^javascript:/i.test(hrefValue.trim())) {
      attributes.href = hrefValue;
    }
  }

  const titleMatch = raw.match(/title\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
  if (titleMatch) {
    const titleValue = titleMatch[2] ?? titleMatch[3] ?? titleMatch[4] ?? '';
    attributes.title = titleValue;
  }

  return Object.keys(attributes).length > 0 ? attributes : undefined;
};

const createElementNode = (
  tag: KnowledgeContentElementTag,
  children: KnowledgeContentNode[],
  attributes?: Record<string, string>,
): KnowledgeContentNode => ({
  type: 'element',
  name: tag,
  children,
  ...(attributes ? { attributes } : {}),
});

const convertChildNodes = (nodes: NodeListOf<ChildNode>): KnowledgeContentNode[] =>
  Array.from(nodes)
    .map((node) => convertNodeFromDom(node))
    .filter((node): node is KnowledgeContentNode => node !== null);

const convertNodeFromDom = (node: ChildNode): KnowledgeContentNode | null => {
  if (node.nodeType === TEXT_NODE) {
    const value = node.textContent ?? '';
    if (value.length === 0) {
      return null;
    }

    return {
      type: 'text',
      value,
    };
  }

  if (node.nodeType === ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();

    if (!allowedTagSet.has(tagName)) {
      return null;
    }

    const children = convertChildNodes(element.childNodes as NodeListOf<ChildNode>);

    let attributes: Record<string, string> | undefined;
    if (tagName === 'a') {
      const href = element.getAttribute('href');
      if (href && !/^javascript:/i.test(href)) {
        attributes = { href };
        const title = element.getAttribute('title');
        if (title) {
          attributes.title = title;
        }
      }
    }

    return createElementNode(tagName as KnowledgeContentElementTag, children, attributes);
  }

  return null;
};

const parseHtmlWithDom = (html: string): KnowledgeContentNode[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const template = window.document.createElement('template');
  template.innerHTML = html;

  return convertChildNodes(template.content.childNodes as NodeListOf<ChildNode>);
};

const parseHtmlWithoutDom = (html: string): KnowledgeContentNode[] => {
  const stack: { tag: KnowledgeContentElementTag | null; children: KnowledgeContentNode[]; attributes?: Record<string, string> }[] = [
    { tag: null, children: [] },
  ];

  const tokenRegex = /<\/?([a-z0-9]+)([^>]*?)\/?>|([^<]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(html)) !== null) {
    const [token, tagName, attributeRaw, textContent] = match;

    if (textContent && textContent.length > 0) {
      const value = decodeHtmlEntities(textContent);
      if (value.length > 0) {
        stack[stack.length - 1].children.push({
          type: 'text',
          value,
        });
      }
      continue;
    }

    if (!tagName) {
      continue;
    }

    const normalised = tagName.toLowerCase();
    if (!allowedTagSet.has(normalised)) {
      continue;
    }

    if (token.startsWith('</')) {
      for (let index = stack.length - 1; index > 0; index--) {
        const entry = stack[index];
        if (entry.tag === normalised) {
          stack.pop();
          stack[stack.length - 1].children.push(
            createElementNode(entry.tag!, entry.children, entry.attributes),
          );
          break;
        }
      }
      continue;
    }

    if (normalised === 'br') {
      stack[stack.length - 1].children.push(createElementNode('br', []));
      continue;
    }

    const attributes = normalised === 'a' ? extractAnchorAttributes(attributeRaw ?? '') : undefined;
    const entry = { tag: normalised as KnowledgeContentElementTag, children: [] as KnowledgeContentNode[], attributes };
    stack.push(entry);

    if (/\/>\s*$/.test(token)) {
      stack.pop();
      stack[stack.length - 1].children.push(
        createElementNode(entry.tag, entry.children, entry.attributes),
      );
    }
  }

  while (stack.length > 1) {
    const entry = stack.pop()!;
    stack[stack.length - 1].children.push(
      createElementNode(entry.tag!, entry.children, entry.attributes),
    );
  }

  return stack[0].children;
};

const parseHtmlToNodes = (html: string): KnowledgeContentNode[] => {
  if (typeof window !== 'undefined') {
    const domNodes = parseHtmlWithDom(html);
    if (domNodes.length > 0) {
      return domNodes;
    }
  }

  return parseHtmlWithoutDom(html);
};

const sanitizeHtml = (html: string): string => {
  const purify = getDomPurify();
  if (purify) {
    return purify.sanitize(html, {
      ALLOWED_TAGS: Array.from(allowedTagSet),
      ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
    }) as string;
  }

  return sanitizeHtmlWithoutDom(html);
};

export const createSanitizedContentNodes = (
  rawContent: string | null | undefined,
): KnowledgeContentNode[] => {
  if (!rawContent) {
    return [];
  }

  const html = convertRawContentToHtml(rawContent);
  if (!html) {
    return [];
  }

  const sanitised = sanitizeHtml(html);
  if (!sanitised) {
    return [];
  }

  return parseHtmlToNodes(sanitised);
};
