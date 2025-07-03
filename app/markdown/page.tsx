"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

export default function MarkdownPage() {
  const [markdown, setMarkdown] = useState('# Welcome to Markdown Preview\n\nPaste your Obsidian markdown here and see it rendered beautifully!\n\n## Features\n- Live preview\n- Print-friendly formatting\n- Syntax highlighting\n- GitHub Flavored Markdown support\n\n```javascript\nconsole.log("Hello, World!");\n```\n\n> This is a blockquote example\n\n**Bold text** and *italic text* are supported.\n\n- [x] Task lists\n- [ ] Are supported too');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @page {
          margin: 0.75in;
          size: letter;
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            font-family: Georgia, 'Times New Roman', serif;
            line-height: 1.6;
            color: #000 !important;
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          header {
            display: none !important;
          }
          .print-area h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid #000;
            padding-bottom: 0.5rem;
            break-after: avoid;
          }
          .print-area h2 {
            font-size: 1.5rem;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            break-after: avoid;
          }
          .print-area h3 {
            font-size: 1.25rem;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
            break-after: avoid;
          }
          .print-area p {
            margin-bottom: 1rem;
            orphans: 2;
            widows: 2;
          }
          .print-area pre {
            background: #f5f5f5 !important;
            padding: 1rem;
            border-radius: 4px;
            border: 1px solid #ddd;
            overflow-x: auto;
            break-inside: avoid;
          }
          .print-area blockquote {
            border-left: 4px solid #ccc;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            break-inside: avoid;
          }
          .print-area ul, .print-area ol {
            margin-bottom: 1rem;
            padding-left: 2rem;
          }
          .print-area li {
            margin-bottom: 0.25rem;
            break-inside: avoid;
          }
          .print-area table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1rem;
            break-inside: avoid;
          }
          .print-area th, .print-area td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .print-area th {
            background-color: #f5f5f5 !important;
            font-weight: bold;
          }
          .print-area input[type="checkbox"] {
            width: 16px !important;
            height: 16px !important;
            margin-right: 8px !important;
            vertical-align: middle !important;
            border: 2px solid #000 !important;
            background: white !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
            position: relative !important;
            cursor: pointer !important;
          }
          .print-area input[type="checkbox"]:checked {
            background: white !important;
            border: 2px solid #000 !important;
          }
          .print-area input[type="checkbox"]:checked::after {
            content: "" !important;
            position: absolute !important;
            top: 2px !important;
            left: 4px !important;
            width: 4px !important;
            height: 8px !important;
            border: solid #000 !important;
            border-width: 0 2px 2px 0 !important;
            transform: rotate(45deg) !important;
          }
        }
        
        @media screen {
          .markdown-preview {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #24292e;
          }
          .markdown-preview h1 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e1e4e8;
            padding-bottom: 0.3rem;
          }
          .markdown-preview h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
          }
          .markdown-preview h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
          }
          .markdown-preview p {
            margin-bottom: 1rem;
          }
          .markdown-preview pre {
            background: #f6f8fa;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            border: 1px solid #e1e4e8;
          }
          .markdown-preview code {
            background: #f6f8fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 85%;
          }
          .markdown-preview pre code {
            background: transparent;
            padding: 0;
          }
          .markdown-preview blockquote {
            border-left: 4px solid #dfe2e5;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #6a737d;
          }
          .markdown-preview ul, .markdown-preview ol {
            margin-bottom: 1rem;
            padding-left: 2rem;
          }
          .markdown-preview li {
            margin-bottom: 0.25rem;
          }
          .markdown-preview table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1rem;
          }
          .markdown-preview th, .markdown-preview td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
          }
          .markdown-preview th {
            background-color: #f6f8fa;
            font-weight: 600;
          }
          .markdown-preview a {
            color: #0366d6;
            text-decoration: none;
          }
          .markdown-preview a:hover {
            text-decoration: underline;
          }
          .markdown-preview strong {
            font-weight: 600;
          }
          .markdown-preview em {
            font-style: italic;
          }
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="no-print mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Markdown Preview & Print</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    !isPreviewMode 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setIsPreviewMode(true)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    isPreviewMode 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
              </div>
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Paste your Obsidian markdown and toggle between edit and preview modes. Use the print button to print only the rendered content.
          </p>
        </div>

        <div className="w-full">
          {!isPreviewMode ? (
            /* Edit Mode */
            <div className="no-print">
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Paste your Obsidian markdown here..."
              />
              <p className="text-sm text-gray-500 mt-2">
                Supports GitHub Flavored Markdown, syntax highlighting, and task lists.
              </p>
            </div>
          ) : (
            /* Preview Mode */
            <div className="print-area markdown-preview bg-white border border-gray-300 rounded-lg p-6 min-h-96 overflow-y-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // Custom components for better styling
                  h1: ({children}) => <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-semibold mt-6 mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
                  p: ({children}) => <p className="mb-4">{children}</p>,
                  ul: ({children}) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
                  li: ({children}) => <li className="mb-1">{children}</li>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">{children}</blockquote>,
                  code: ({inline, children}) => 
                    inline ? 
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code> :
                      <code>{children}</code>,
                  table: ({children}) => <table className="w-full border-collapse border border-gray-300 my-4">{children}</table>,
                  th: ({children}) => <th className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-left">{children}</th>,
                  td: ({children}) => <td className="border border-gray-300 px-3 py-2">{children}</td>,
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </>
  );
}