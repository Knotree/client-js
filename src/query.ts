import { formatFilterValue, request, type RequestContext } from "./http.js";
import type { GenericDatabase, GenericTable, OrderOptions, Result } from "./types.js";

type Filter = { column: string; op: string; value: string };

type BuilderState = {
  table: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  select?: string;
  filters: Filter[];
  order: string[];
  limit?: number;
  offset?: number;
  body?: unknown;
  returning?: "representation" | "minimal";
  wantSingle?: "single" | "maybeSingle";
};

export class QueryBuilder<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Row = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Insert = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Update = any,
> implements PromiseLike<Result<Row[] | Row | null>> {
  private state: BuilderState;

  constructor(
    private readonly ctx: RequestContext,
    table: string,
  ) {
    this.state = {
      table,
      method: "GET",
      filters: [],
      order: [],
    };
  }

  select(columns: string = "*"): this {
    this.state.select = columns;
    if (this.state.method === "POST" || this.state.method === "PATCH" || this.state.method === "DELETE") {
      this.state.returning = "representation";
    } else {
      this.state.method = "GET";
    }
    return this;
  }

  insert(values: Insert | Insert[]): this {
    this.state.method = "POST";
    this.state.body = values;
    this.state.returning = "representation";
    return this;
  }

  update(values: Update): this {
    this.state.method = "PATCH";
    this.state.body = values;
    this.state.returning = "representation";
    return this;
  }

  delete(): this {
    this.state.method = "DELETE";
    this.state.returning = "representation";
    return this;
  }

  eq(column: string, value: unknown): this {
    return this.filter(column, "eq", value);
  }

  neq(column: string, value: unknown): this {
    return this.filter(column, "neq", value);
  }

  gt(column: string, value: unknown): this {
    return this.filter(column, "gt", value);
  }

  gte(column: string, value: unknown): this {
    return this.filter(column, "gte", value);
  }

  lt(column: string, value: unknown): this {
    return this.filter(column, "lt", value);
  }

  lte(column: string, value: unknown): this {
    return this.filter(column, "lte", value);
  }

  like(column: string, value: string): this {
    return this.filter(column, "like", value);
  }

  ilike(column: string, value: string): this {
    return this.filter(column, "ilike", value);
  }

  in(column: string, values: unknown[]): this {
    const inner = values.map((v) => formatFilterValue(v)).join(",");
    this.state.filters.push({ column, op: "in", value: `(${inner})` });
    return this;
  }

  is(column: string, value: null | boolean): this {
    if (value === null) {
      this.state.filters.push({ column, op: "is", value: "null" });
    } else {
      this.state.filters.push({ column, op: "is", value: value ? "true" : "false" });
    }
    return this;
  }

  order(column: string, options?: OrderOptions): this {
    const dir = options?.ascending === false ? "desc" : "asc";
    this.state.order.push(`${column}.${dir}`);
    return this;
  }

  limit(count: number): this {
    this.state.limit = count;
    return this;
  }

  /** Inclusive range [from, to] mapped to limit/offset. */
  range(from: number, to: number): this {
    this.state.offset = from;
    this.state.limit = to - from + 1;
    return this;
  }

  single(): this {
    this.state.wantSingle = "single";
    if (this.state.limit === undefined) {
      this.state.limit = 1;
    }
    return this;
  }

  maybeSingle(): this {
    this.state.wantSingle = "maybeSingle";
    if (this.state.limit === undefined) {
      this.state.limit = 1;
    }
    return this;
  }

  then<TResult1 = Result<Row[] | Row | null>, TResult2 = never>(
    onfulfilled?:
      | ((value: Result<Row[] | Row | null>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  async execute(): Promise<Result<Row[] | Row | null>> {
    const path = `/v1/data/${encodeURIComponent(this.state.table)}`;
    const query: Record<string, string | undefined> = {};

    if (this.state.method === "GET") {
      if (this.state.select && this.state.select !== "*") {
        query.select = this.state.select;
      }
    } else if (this.state.returning) {
      query.returning = this.state.returning;
    }

    for (const f of this.state.filters) {
      query[f.column] = `${f.op}.${f.value}`;
    }
    if (this.state.order.length) {
      query.order = this.state.order.join(",");
    }
    if (this.state.limit !== undefined) {
      query.limit = String(this.state.limit);
    }
    if (this.state.offset !== undefined) {
      query.offset = String(this.state.offset);
    }

    const result = await request<Row[] | Row>(this.ctx, this.state.method, path, {
      body: this.state.body,
      query,
      auth: true,
    });

    if (result.error) {
      return { data: null, error: result.error, count: result.count, requestId: result.requestId };
    }

    return this.normalizeResult(result.data, result.count, result.requestId);
  }

  private filter(column: string, op: string, value: unknown): this {
    this.state.filters.push({ column, op, value: formatFilterValue(value) });
    return this;
  }

  private normalizeResult(
    data: Row[] | Row | null,
    count?: number,
    requestId?: string,
  ): Result<Row[] | Row | null> {
    const rows = normalizeRows<Row>(data);

    if (this.state.wantSingle === "single") {
      if (rows.length === 0) {
        return {
          data: null,
          error: { code: "PROJECT_NOT_FOUND", message: "JSON object requested, multiple (or no) rows returned" },
          count,
          requestId,
        };
      }
      if (rows.length > 1) {
        return {
          data: null,
          error: { code: "INVALID_REQUEST", message: "JSON object requested, multiple rows returned" },
          count,
          requestId,
        };
      }
      return { data: rows[0]!, error: null, count, requestId };
    }

    if (this.state.wantSingle === "maybeSingle") {
      if (rows.length > 1) {
        return {
          data: null,
          error: { code: "INVALID_REQUEST", message: "JSON object requested, multiple rows returned" },
          count,
          requestId,
        };
      }
      return { data: rows[0] ?? null, error: null, count, requestId };
    }

    // insert single object → API may return object; normalize to array for multi, object when single insert?
    // Spec returns data as array for list; single insert may return object. Expose as returned by API for non-select.
    if (this.state.method === "POST" && data !== null && !Array.isArray(data)) {
      return { data: data as Row, error: null, count, requestId };
    }

    return { data: rows, error: null, count, requestId };
  }
}

function normalizeRows<Row>(data: Row[] | Row | null): Row[] {
  if (data === null || data === undefined) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [data];
}

export type TableName<DB extends GenericDatabase> = Extract<keyof DB, string>;

export type RowOf<DB extends GenericDatabase, T extends TableName<DB>> = DB[T] extends GenericTable
  ? DB[T]["Row"]
  : never;

export type InsertOf<DB extends GenericDatabase, T extends TableName<DB>> = DB[T] extends GenericTable
  ? DB[T]["Insert"]
  : never;

export type UpdateOf<DB extends GenericDatabase, T extends TableName<DB>> = DB[T] extends GenericTable
  ? DB[T]["Update"]
  : never;
