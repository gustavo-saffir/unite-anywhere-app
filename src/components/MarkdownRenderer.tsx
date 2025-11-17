interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  if (!content) return null;

  // Simple markdown parser
  const parseMarkdown = (text: string) => {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    // Underline
    text = text.replace(/__(.*?)__/g, '<u class="underline">$1</u>');
    // Bullet points
    text = text.replace(/^• (.+)$/gm, '<li class="text-inherit">$1</li>');
    // Wrap consecutive <li> in <ul>
    text = text.replace(/(<li.*?<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-1 my-2 text-inherit">$&</ul>');
    // Line breaks
    text = text.replace(/\n/g, '<br />');
    
    return text;
  };

  return (
    <div
      className={`break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};
