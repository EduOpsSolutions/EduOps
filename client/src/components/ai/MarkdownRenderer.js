import React from 'react';
import PropTypes from 'prop-types';

/**
 * Simple Markdown Renderer for AI responses
 * Handles common markdown syntax without external dependencies
 */
function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Process the content and convert markdown to HTML
  const processMarkdown = (text) => {
    let html = text;

    // Code blocks (```code```)
    html = html.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (match, lang, code) =>
        `<pre class="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto my-2"><code class="text-sm">${escapeHtml(
          code.trim()
        )}</code></pre>`
    );

    // Tables (| header | header |)
    const tableRegex = /(\|.+\|\r?\n)((?:\|:?-+:?)+\|)(\r?\n(?:\|.+\|\r?\n?)*)/g;
    html = html.replace(tableRegex, (match) => {
      const rows = match.trim().split('\n');
      if (rows.length < 2) return match;

      // Parse header
      const headers = rows[0]
        .split('|')
        .slice(1, -1)
        .map((h) => h.trim());

      // Parse alignment row (if exists)
      const alignments = rows[1]
        .split('|')
        .slice(1, -1)
        .map((a) => {
          const trimmed = a.trim();
          if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
          if (trimmed.endsWith(':')) return 'right';
          return 'left';
        });

      // Parse data rows
      const dataRows = rows.slice(2).map((row) =>
        row
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim())
      );

      // Build table HTML with dark mode support
      let tableHtml = '<div class="overflow-x-auto my-3"><table class="min-w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">';

      // Header
      tableHtml += '<thead class="bg-gray-700 dark:bg-gray-900"><tr>';
      headers.forEach((header, i) => {
        const align = alignments[i] || 'left';
        tableHtml += `<th class="border border-gray-400 dark:border-gray-600 px-3 py-2 text-${align} font-semibold text-sm text-white dark:text-gray-200">${header}</th>`;
      });
      tableHtml += '</tr></thead>';

      // Body
      tableHtml += '<tbody class="bg-white dark:bg-gray-800">';
      dataRows.forEach((row) => {
        tableHtml += '<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">';
        row.forEach((cell, i) => {
          const align = alignments[i] || 'left';
          tableHtml += `<td class="border border-gray-300 dark:border-gray-600 px-3 py-2 text-${align} text-sm text-gray-800 dark:text-gray-200">${cell}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table></div>';

      return tableHtml;
    });

    // Inline code (`code`)
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
    );

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-3 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');

    // Bold (**text** or __text__)
    html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong class="font-semibold">$2</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/(\*|_)(.*?)\1/g, '<em class="italic">$2</em>');

    // Links [text](url)
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
    );

    // Unordered lists (- item or * item)
    html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/(<li class="ml-4">.*<\/li>\n?)+/g, '<ul class="list-disc my-2">$&</ul>');

    // Ordered lists (1. item)
    html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/(<li class="ml-4">.*<\/li>\n?)+/g, (match) => {
      // Only convert to ol if it's not already in a ul
      if (!match.includes('list-disc')) {
        return `<ol class="list-decimal my-2">${match}</ol>`;
      }
      return match;
    });

    // Line breaks (two spaces at end of line or \n)
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  // Escape HTML to prevent XSS
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const processedContent = processMarkdown(content);

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

MarkdownRenderer.propTypes = {
  content: PropTypes.string,
};

export default MarkdownRenderer;
