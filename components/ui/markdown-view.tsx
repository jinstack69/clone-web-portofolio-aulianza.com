'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-8 overflow-hidden rounded-[22px] border border-line bg-[#070a1a] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs font-mono text-white/60">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-[#19c39c]" />
              <span className="text-[#19c39c]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[14px] leading-relaxed text-white/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownView({ content }: MarkdownViewProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: string[] = [];
  let isNumbered = false;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  const flushList = (key: number) => {
    if (currentList.length === 0) return;
    if (isNumbered) {
      elements.push(
        <ol key={`ol-${key}`} className="mb-6 space-y-2 list-decimal ps-6 font-medium">
          {currentList.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={`ul-${key}`} className="mb-6 space-y-2 list-disc ps-6 font-medium">
          {currentList.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
    }
    currentList = [];
    isNumbered = false;
  };

  const flushTable = (key: number) => {
    if (!inTable) return;
    elements.push(
      <div key={`table-${key}`} className="my-8 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-start text-sm">
          {tableHeader.length > 0 && (
            <thead className="border-b border-line bg-paper text-ink font-bold">
              <tr>
                {tableHeader.map((th, i) => (
                  <th key={i} className="px-5 py-3 text-start">
                    {th.trim()}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-line">
            {tableRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-paper/40">
                {row.map((td, cIdx) => (
                  <td key={cIdx} className="px-5 py-3.5 font-medium text-ink/80">
                    {td.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    inTable = false;
    tableHeader = [];
    tableRows = [];
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-ink">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="rounded bg-[#2f45ff]/10 px-1.5 py-0.5 text-sm font-mono font-bold text-cobalt">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="font-bold text-cobalt underline hover:text-ink transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <CodeBlock
            key={`code-${idx}`}
            code={codeBuffer.join('\n')}
            language={codeLanguage}
          />
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLanguage = '';
      } else {
        flushList(idx);
        flushTable(idx);
        inCodeBlock = true;
        codeLanguage = trimmed.replace('```', '').trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Markdown Table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(idx);
      const cells = trimmed.split('|').slice(1, -1);
      if (cells.every((c) => /^[-:\s]+$/.test(c))) {
        // Separator row
        return;
      }
      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    // Headings
    if (trimmed.startsWith('## ')) {
      flushList(idx);
      flushTable(idx);
      const text = trimmed.replace('## ', '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      elements.push(
        <h2
          key={`h2-${idx}`}
          id={id}
          className="scroll-mt-28 font-bold text-ink text-balance mb-5 mt-16 text-[clamp(1.65rem,2.6vw,2.15rem)] leading-[1.15] tracking-[-0.025em] first:mt-0"
        >
          {text}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList(idx);
      flushTable(idx);
      const text = trimmed.replace('### ', '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      elements.push(
        <h3
          key={`h3-${idx}`}
          id={id}
          className="scroll-mt-28 font-bold text-ink text-balance mb-4 mt-10 text-[clamp(1.3rem,2vw,1.75rem)] leading-[1.2] tracking-[-0.02em]"
        >
          {text}
        </h3>
      );
    } else if (trimmed.startsWith('#### ')) {
      flushList(idx);
      flushTable(idx);
      const text = trimmed.replace('#### ', '');
      elements.push(
        <h4
          key={`h4-${idx}`}
          className="font-bold text-ink mb-3 mt-6 text-lg tracking-tight"
        >
          {text}
        </h4>
      );
    } else if (trimmed.startsWith('> ')) {
      flushList(idx);
      flushTable(idx);
      const quoteText = trimmed.replace('> ', '');
      elements.push(
        <blockquote
          key={`quote-${idx}`}
          className="my-6 border-s-4 border-cobalt bg-white/60 p-4 rounded-e-2xl text-base font-medium italic text-ink"
          dangerouslySetInnerHTML={{ __html: formatInline(quoteText) }}
        />
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (isNumbered) flushList(idx);
      isNumbered = false;
      currentList.push(trimmed.substring(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!isNumbered) flushList(idx);
      isNumbered = true;
      currentList.push(trimmed.replace(/^\d+\.\s/, ''));
    } else if (trimmed.length > 0) {
      flushList(idx);
      flushTable(idx);
      elements.push(
        <p
          key={`p-${idx}`}
          className="mb-6 font-medium leading-[1.75] text-ink/85"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
        />
      );
    }
  });

  flushList(lines.length);
  flushTable(lines.length);

  return (
    <article lang="en" className="max-w-[50rem]">
      <div className="article-body text-[1.0625rem] font-medium leading-[1.75] text-ink/85 md:text-[1.125rem]">
        {elements}
      </div>
    </article>
  );
}
