import { AuthClient } from "./auth.js";
import type { RequestContext } from "./http.js";
import {
  QueryBuilder,
  type InsertOf,
  type RowOf,
  type TableName,
  type UpdateOf,
} from "./query.js";
import { createDefaultStorage } from "./storage.js";
import { EdgeFunctionsClient } from "./functions.js";
import { ImagesClient } from "./images.js";
import type { ClientOptions, GenericDatabase, ResolvedClientOptions } from "./types.js";

export const DEFAULT_API_URL = "https://tinybaseapis.knotree.com";

export class TinyBaseClient<DB extends GenericDatabase = GenericDatabase> {
  readonly auth: AuthClient;
  readonly functions: EdgeFunctionsClient;
  readonly images: ImagesClient;
  private readonly options: ResolvedClientOptions;

  constructor(options: ClientOptions) {
    if (!options.projectKey) {
      throw new Error("ClientOptions.projectKey is required");
    }
    this.options = {
      ...options,
      url: options.url || DEFAULT_API_URL,
      storage: options.storage ?? createDefaultStorage(),
      autoRefreshToken: options.autoRefreshToken !== false,
      persistSession: options.persistSession !== false,
    };
    this.auth = new AuthClient(this.options, () => this.requestContext());
    this.functions = new EdgeFunctionsClient(() => this.requestContext());
    this.images = new ImagesClient(() => this.requestContext());
  }

  /** Typed query builder for a table. */
  from<T extends TableName<DB>>(table: T): QueryBuilder<RowOf<DB, T>, InsertOf<DB, T>, UpdateOf<DB, T>>;
  from(table: string): QueryBuilder;
  from(table: string): QueryBuilder {
    return new QueryBuilder(this.requestContext(), table);
  }

  /**
   * Invoke a PostgreSQL function in the project schema (US-067).
   * Args are named parameters matching the function signature.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async rpc<T = any>(
    fn: string,
    args: Record<string, unknown> = {},
  ): Promise<{ data: T | null; error: { message: string } | null }> {
    const { request } = await import("./http.js");
    const res = await request<T>(this.requestContext(), "POST", `/v1/rpc/${encodeURIComponent(fn)}`, {
      body: args,
    });
    return { data: res.data ?? null, error: res.error };
  }

  private requestContext(): RequestContext {
    return {
      options: this.options,
      getAccessToken: () => this.auth.getAccessToken(),
      onUnauthorized: () => this.auth.handleUnauthorized(),
    };
  }
}

export function createClient<DB extends GenericDatabase = GenericDatabase>(
  options: ClientOptions,
): TinyBaseClient<DB> {
  return new TinyBaseClient<DB>(options);
}
