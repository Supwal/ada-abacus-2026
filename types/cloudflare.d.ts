// Declaração mínima do binding R2 (subconjunto da API que este projeto usa).
// @cloudflare/workers-types não está instalado — só declaramos o necessário
// para lib/r2.ts e as rotas que leem/gravam/apagam objetos no bucket.

interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

interface R2HttpMetadata {
  contentType?: string;
  contentDisposition?: string;
}

interface R2Object {
  key: string;
  size: number;
  httpEtag: string;
  httpMetadata?: R2HttpMetadata;
  writeHttpMetadata(headers: Headers): void;
}

interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  range?: { offset: number; length: number };
}

interface R2Bucket {
  get(
    key: string,
    options?: { range?: R2Range }
  ): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
    options?: { httpMetadata?: R2HttpMetadata }
  ): Promise<R2Object>;
  delete(keys: string | string[]): Promise<void>;
}
