import { useEffect, useState } from "react";
import { imageService } from "../../services/imageService";
import { ProductThumb } from "./ProductThumb";
import {productArtwork} from '../../utils/productArtwork';
export function ProductImage({
  imageId,
  name,
  large = false,
}: {
  imageId?: string;
  name: string;
  large?: boolean;
}) {
  const [source, setSource] = useState<{ id: string; url: string }>();
  useEffect(() => {
    let live = true;
    let url = "";
    if (imageId)
      void imageService
        .get(imageId)
        .then((blob) => {
          if (!live || !blob) return;
          url = URL.createObjectURL(blob);
          setSource({ id: imageId, url });
        })
        .catch(() => {
          /* Missing or inaccessible images use the neutral placeholder. */
        });
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [imageId]);
  const url=source && source.id===imageId?source.url:productArtwork(name);
  return url ? (
    <img
      src={url}
      loading="lazy"
      decoding="async"
      alt={name}
      className={`rounded-lg bg-slate-100 object-contain dark:bg-slate-800 ${large ? "aspect-square w-full" : "h-10 w-10"}`}
    />
  ) : (
    <ProductThumb large={large} />
  );
}
