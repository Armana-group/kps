import { splitTextLinks } from '@/lib/text-links';

export function LinkedText({ text }: { text: string }) {
  return (
    <p className="min-w-0 max-w-full text-muted-foreground leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
      {splitTextLinks(text).map((part, index) => part.href ? (
        <a key={index} href={part.href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80" title="Open in a new tab">
          {part.text}
        </a>
      ) : part.text)}
    </p>
  );
}
