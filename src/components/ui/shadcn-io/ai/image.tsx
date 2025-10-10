import { cn } from '@/lib/utils';
import type { Experimental_GeneratedImage } from 'ai';

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({
  base64,
  // uint8Array,
  mediaType = 'image/png',
  ...props
}: ImageProps) => {
  // Use native img for base64 data URIs as Next.js Image doesn't optimize them the same way.
  // This is intentional for generated images; we include a rule override with justification.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={props.alt || 'Generated AI image'}
      className={cn(
        'h-auto max-w-full overflow-hidden rounded-md',
        props.className
      )}
      src={`data:${mediaType};base64,${base64}`}
      decoding="async"
      loading="lazy"
    />
  );
};
