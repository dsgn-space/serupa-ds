/* The Standard Schema interface (standardschema.dev, MIT), version 1: the one shape Zod (3.24 and later), Valibot (1.0
   and later), ArkType and others all give their schemas under the "~standard" key. Form reads only this, so it works
   with whichever of them a project already uses, and the package depends on none of them. The spec asks libraries to
   copy these types rather than depend on a package for them. */
/** A schema from any library that follows Standard Schema v1: Zod, Valibot, ArkType and others. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The library's own Standard Schema properties. */
  readonly '~standard': StandardSchemaProps<Input, Output>;
}
/** What a schema gives under "~standard". */
export interface StandardSchemaProps<Input = unknown, Output = Input> {
  readonly version: 1;
  readonly vendor: string;
  readonly validate: (value: unknown) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
  readonly types?: { readonly input: Input; readonly output: Output } | undefined;
}
/** The value, or what's wrong with it. */
export type StandardSchemaResult<Output> = { readonly value: Output; readonly issues?: undefined } | { readonly issues: ReadonlyArray<StandardSchemaIssue> };
/** One problem, and where in the value it is. */
export interface StandardSchemaIssue { readonly message: string; readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined }
/** The type a schema takes. */
export type InferInput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['input'];
/** The type a schema gives back once the value passes. */
export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['output'];
