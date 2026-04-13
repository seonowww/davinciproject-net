/**
 * Convert Squidex RichText (ProseMirror JSON) to HTML string.
 *
 * Supported nodes: heading, paragraph, bulletList, orderedList,
 * listItem, blockquote, codeBlock, horizontalRule, image, text
 */

interface ProseMirrorNode {
  type: string;
  attrs?: Record<string, any>;
  content?: ProseMirrorNode[];
  text?: string;
  marks?: Array<{ type: string }>;
}

export function richTextToHtml(node: ProseMirrorNode | null): string {
  if (!node) return '';
  return renderNode(node);
}

function renderNode(node: ProseMirrorNode): string {
  switch (node.type) {
    case 'doc':
      return (node.content || []).map(renderNode).join('\n');

    case 'heading': {
      const level = node.attrs?.level || 1;
      const clampedLevel = Math.min(Math.max(level, 1), 6);
      const content = renderInlineContent(node.content || []);
      return `<h${clampedLevel}>${content}</h${clampedLevel}>`;
    }

    case 'paragraph': {
      const content = renderInlineContent(node.content || []);
      return `<p>${content}</p>`;
    }

    case 'bulletList': {
      const items = (node.content || []).map(renderNode).join('\n');
      return `<ul>${items}</ul>`;
    }

    case 'orderedList': {
      const items = (node.content || []).map(renderNode).join('\n');
      return `<ol>${items}</ol>`;
    }

    case 'listItem': {
      const content = (node.content || []).map(renderNode).join('');
      return `<li>${content}</li>`;
    }

    case 'blockquote': {
      const content = (node.content || []).map(renderNode).join('\n');
      return `<blockquote>${content}</blockquote>`;
    }

    case 'codeBlock': {
      const text = node.content
        ?.filter((n) => n.type === 'text')
        .map((n) => escapeHtml(n.text || ''))
        .join('');
      return `<pre><code>${text}</code></pre>`;
    }

    case 'horizontalRule':
      return '<hr />';

    case 'image': {
      const src = node.attrs?.src || '';
      const alt = node.attrs?.alt || '';
      const title = node.attrs?.title ? ` title="${escapeHtml(node.attrs.title)}"` : '';
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${title} />`;
    }

    case 'text':
      return renderTextNode(node);

    default:
      return '';
  }
}

function renderTextNode(node: ProseMirrorNode): string {
  let text = escapeHtml(node.text || '');
  const marks = node.marks || [];

  for (const mark of marks) {
    switch (mark.type) {
      case 'code':
        text = `<code>${text}</code>`;
        break;
      case 'strong':
        text = `<strong>${text}</strong>`;
        break;
      case 'em':
        text = `<em>${text}</em>`;
        break;
      case 'link': {
        const href = mark.attrs?.href || '#';
        const target = mark.attrs?.target || '';
        text = `<a href="${escapeHtml(href)}"${target ? ` target="${target}"` : ''}>${text}</a>`;
        break;
      }
    }
  }

  return text;
}

function renderInlineContent(nodes: ProseMirrorNode[]): string {
  return nodes
    .filter((n) => n.type === 'text')
    .map(renderTextNode)
    .join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
