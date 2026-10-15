import { createStore, get, set, del, entries, setMany } from "idb-keyval";
const imageStore = createStore("tindapos:images", "images");
export const imageService = {
  save: async (blob: Blob) => {
    const id = crypto.randomUUID();
    await set(id, blob, imageStore);
    return id;
  },
  get: async (id: string) => {
    const value = await get<unknown>(id, imageStore);
    return value instanceof Blob ? value : undefined;
  },
  remove: (id: string) => del(id, imageStore),
  export: async () => {
    const all = await entries<string, Blob>(imageStore);
    return Object.fromEntries(
      await Promise.all(
        all.map(async ([id, blob]) => [
          id,
          await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Image export failed."));
            reader.readAsDataURL(blob);
          }),
        ]),
      ),
    );
  },
  import: (images: [string, Blob][]) => setMany(images, imageStore),
};
