interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  if (!content) return null;

  // Simple markdown parser
  const parseMarkdown = (text: string) => {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Underline
    text = text.replace(/__(.*?)__/g, '<u>$1</u>');
    // Bullet points
    text = text.replace(/^• (.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-1 my-2">$&</ul>');
    // Line breaks
    text = text.replace(/\n/g, '<br />');
    
    return text;
  };

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};
