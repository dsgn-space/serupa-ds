/* The Standard Schema interface (standardschema.dev, MIT), version 1: the one shape Zod (3.24 and later), Valibot (1.0
   and later), ArkType and others all give their schemas under the "~standard" key. Form reads only this, so it works
   with whichever of them a project already uses, and the package depends on none of them. The spec asks libraries to
   copy these types rather than depend on a package for them. */
/** A schema from any library that follows Standard Schema v1: Zod, Valibot, ArkType and others. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The library's own Standard Schema properties. */
  readonly '~standard': StandardSchemaV1.Props<Input, Output>;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- the shape the spec publishes, so the types read the same everywhere
export declare namespace StandardSchemaV1 {
  /** What a schema gives under "~standard". */
  export interface Props<Input = unknown, Output = Input> {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>;
    readonly types?: Types<Input, Output> | undefined;
  }
  /** The value, or what's wrong with it. */
  export type Result<Output> = SuccessResult<Output> | FailureResult;
  export interface SuccessResult<Output> { readonly value: Output; readonly issues?: undefined }
  export interface FailureResult { readonly issues: ReadonlyArray<Issue> }
  /** One problem, and where in the value it is. */
  export interface Issue { readonly message: string; readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined }
  export interface PathSegment { readonly key: PropertyKey }
  export interface Types<Input = unknown, Output = Input> { readonly input: Input; readonly output: Output }
  /** The type a schema takes. */
  export type InferInput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['input'];
  /** The type a schema gives back once the value passes. */
  export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['output'];
}
