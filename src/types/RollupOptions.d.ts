// rollup 4.43.0

//#region node_modules/rollup/node_modules/@types/estree/index.d.ts
// This definition file follows a somewhat unusual format. ESTree allows
// runtime type checks based on the `type` parameter. In order to explain this
// to typescript we want to use discriminated union types:
// https://github.com/Microsoft/TypeScript/pull/9163
//
// For ESTree this is a bit tricky because the high level interfaces like
// Node or Function are pulling double duty. We want to pass common fields down
// to the interfaces that extend them (like Identifier or
// ArrowFunctionExpression), but you can't extend a type union or enforce
// common fields on them. So we've split the high level interfaces into two
// types, a base type which passes down inherited fields, and a type union of
// all types which extend the base type. Only the type union is exported, and
// the union is how other types refer to the collection of inheriting types.
//
// This makes the definitions file here somewhat more difficult to maintain,
// but it has the notable advantage of making ESTree much easier to use as
// an end user.
interface BaseNodeWithoutComments {
  // Every leaf interface that extends BaseNode must specify a type property.
  // The type property should be a string literal. For example, Identifier
  // has: `type: "Identifier"`
  type: string;
  loc?: SourceLocation | null | undefined;
  range?: [number, number] | undefined;
}
interface BaseNode extends BaseNodeWithoutComments {
  leadingComments?: Comment[] | undefined;
  trailingComments?: Comment[] | undefined;
}
interface NodeMap {
  AssignmentProperty: AssignmentProperty;
  CatchClause: CatchClause;
  Class: Class;
  ClassBody: ClassBody;
  Expression: Expression;
  Function: Function;
  Identifier: Identifier;
  Literal: Literal;
  MethodDefinition: MethodDefinition;
  ModuleDeclaration: ModuleDeclaration;
  ModuleSpecifier: ModuleSpecifier;
  Pattern: Pattern;
  PrivateIdentifier: PrivateIdentifier;
  Program: Program;
  Property: Property;
  PropertyDefinition: PropertyDefinition;
  SpreadElement: SpreadElement;
  Statement: Statement;
  Super: Super;
  SwitchCase: SwitchCase;
  TemplateElement: TemplateElement;
  VariableDeclarator: VariableDeclarator;
}
type Node = NodeMap[keyof NodeMap];
interface Comment extends BaseNodeWithoutComments {
  type: "Line" | "Block";
  value: string;
}
interface SourceLocation {
  source?: string | null | undefined;
  start: Position;
  end: Position;
}
interface Position {
  /** >= 1 */
  line: number;
  /** >= 0 */
  column: number;
}
interface Program extends BaseNode {
  type: "Program";
  sourceType: "script" | "module";
  body: Array<Directive | Statement | ModuleDeclaration>;
  comments?: Comment[] | undefined;
}
interface Directive extends BaseNode {
  type: "ExpressionStatement";
  expression: Literal;
  directive: string;
}
interface BaseFunction extends BaseNode {
  params: Pattern[];
  generator?: boolean | undefined;
  async?: boolean | undefined; // The body is either BlockStatement or Expression because arrow functions
  // can have a body that's either. FunctionDeclarations and
  // FunctionExpressions have only BlockStatement bodies.
  body: BlockStatement | Expression;
}
type Function = FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;
type Statement = ExpressionStatement | BlockStatement | StaticBlock | EmptyStatement | DebuggerStatement | WithStatement | ReturnStatement | LabeledStatement | BreakStatement | ContinueStatement | IfStatement | SwitchStatement | ThrowStatement | TryStatement | WhileStatement | DoWhileStatement | ForStatement | ForInStatement | ForOfStatement | Declaration;
interface BaseStatement extends BaseNode {}
interface EmptyStatement extends BaseStatement {
  type: "EmptyStatement";
}
interface BlockStatement extends BaseStatement {
  type: "BlockStatement";
  body: Statement[];
  innerComments?: Comment[] | undefined;
}
interface StaticBlock extends Omit<BlockStatement, "type"> {
  type: "StaticBlock";
}
interface ExpressionStatement extends BaseStatement {
  type: "ExpressionStatement";
  expression: Expression;
}
interface IfStatement extends BaseStatement {
  type: "IfStatement";
  test: Expression;
  consequent: Statement;
  alternate?: Statement | null | undefined;
}
interface LabeledStatement extends BaseStatement {
  type: "LabeledStatement";
  label: Identifier;
  body: Statement;
}
interface BreakStatement extends BaseStatement {
  type: "BreakStatement";
  label?: Identifier | null | undefined;
}
interface ContinueStatement extends BaseStatement {
  type: "ContinueStatement";
  label?: Identifier | null | undefined;
}
interface WithStatement extends BaseStatement {
  type: "WithStatement";
  object: Expression;
  body: Statement;
}
interface SwitchStatement extends BaseStatement {
  type: "SwitchStatement";
  discriminant: Expression;
  cases: SwitchCase[];
}
interface ReturnStatement extends BaseStatement {
  type: "ReturnStatement";
  argument?: Expression | null | undefined;
}
interface ThrowStatement extends BaseStatement {
  type: "ThrowStatement";
  argument: Expression;
}
interface TryStatement extends BaseStatement {
  type: "TryStatement";
  block: BlockStatement;
  handler?: CatchClause | null | undefined;
  finalizer?: BlockStatement | null | undefined;
}
interface WhileStatement extends BaseStatement {
  type: "WhileStatement";
  test: Expression;
  body: Statement;
}
interface DoWhileStatement extends BaseStatement {
  type: "DoWhileStatement";
  body: Statement;
  test: Expression;
}
interface ForStatement extends BaseStatement {
  type: "ForStatement";
  init?: VariableDeclaration | Expression | null | undefined;
  test?: Expression | null | undefined;
  update?: Expression | null | undefined;
  body: Statement;
}
interface BaseForXStatement extends BaseStatement {
  left: VariableDeclaration | Pattern;
  right: Expression;
  body: Statement;
}
interface ForInStatement extends BaseForXStatement {
  type: "ForInStatement";
}
interface DebuggerStatement extends BaseStatement {
  type: "DebuggerStatement";
}
type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration;
interface BaseDeclaration extends BaseStatement {}
interface MaybeNamedFunctionDeclaration extends BaseFunction, BaseDeclaration {
  type: "FunctionDeclaration";
  /** It is null when a function declaration is a part of the `export default function` statement */
  id: Identifier | null;
  body: BlockStatement;
}
interface FunctionDeclaration extends MaybeNamedFunctionDeclaration {
  id: Identifier;
}
interface VariableDeclaration extends BaseDeclaration {
  type: "VariableDeclaration";
  declarations: VariableDeclarator[];
  kind: "var" | "let" | "const";
}
interface VariableDeclarator extends BaseNode {
  type: "VariableDeclarator";
  id: Pattern;
  init?: Expression | null | undefined;
}
interface ExpressionMap {
  ArrayExpression: ArrayExpression;
  ArrowFunctionExpression: ArrowFunctionExpression;
  AssignmentExpression: AssignmentExpression;
  AwaitExpression: AwaitExpression;
  BinaryExpression: BinaryExpression;
  CallExpression: CallExpression;
  ChainExpression: ChainExpression;
  ClassExpression: ClassExpression;
  ConditionalExpression: ConditionalExpression;
  FunctionExpression: FunctionExpression;
  Identifier: Identifier;
  ImportExpression: ImportExpression;
  Literal: Literal;
  LogicalExpression: LogicalExpression;
  MemberExpression: MemberExpression;
  MetaProperty: MetaProperty;
  NewExpression: NewExpression;
  ObjectExpression: ObjectExpression;
  SequenceExpression: SequenceExpression;
  TaggedTemplateExpression: TaggedTemplateExpression;
  TemplateLiteral: TemplateLiteral;
  ThisExpression: ThisExpression;
  UnaryExpression: UnaryExpression;
  UpdateExpression: UpdateExpression;
  YieldExpression: YieldExpression;
}
type Expression = ExpressionMap[keyof ExpressionMap];
interface BaseExpression extends BaseNode {}
type ChainElement = SimpleCallExpression | MemberExpression;
interface ChainExpression extends BaseExpression {
  type: "ChainExpression";
  expression: ChainElement;
}
interface ThisExpression extends BaseExpression {
  type: "ThisExpression";
}
interface ArrayExpression extends BaseExpression {
  type: "ArrayExpression";
  elements: Array<Expression | SpreadElement | null>;
}
interface ObjectExpression extends BaseExpression {
  type: "ObjectExpression";
  properties: Array<Property | SpreadElement>;
}
interface PrivateIdentifier extends BaseNode {
  type: "PrivateIdentifier";
  name: string;
}
interface Property extends BaseNode {
  type: "Property";
  key: Expression | PrivateIdentifier;
  value: Expression | Pattern; // Could be an AssignmentProperty
  kind: "init" | "get" | "set";
  method: boolean;
  shorthand: boolean;
  computed: boolean;
}
interface PropertyDefinition extends BaseNode {
  type: "PropertyDefinition";
  key: Expression | PrivateIdentifier;
  value?: Expression | null | undefined;
  computed: boolean;
  static: boolean;
}
interface FunctionExpression extends BaseFunction, BaseExpression {
  id?: Identifier | null | undefined;
  type: "FunctionExpression";
  body: BlockStatement;
}
interface SequenceExpression extends BaseExpression {
  type: "SequenceExpression";
  expressions: Expression[];
}
interface UnaryExpression extends BaseExpression {
  type: "UnaryExpression";
  operator: UnaryOperator;
  prefix: true;
  argument: Expression;
}
interface BinaryExpression extends BaseExpression {
  type: "BinaryExpression";
  operator: BinaryOperator;
  left: Expression | PrivateIdentifier;
  right: Expression;
}
interface AssignmentExpression extends BaseExpression {
  type: "AssignmentExpression";
  operator: AssignmentOperator;
  left: Pattern | MemberExpression;
  right: Expression;
}
interface UpdateExpression extends BaseExpression {
  type: "UpdateExpression";
  operator: UpdateOperator;
  argument: Expression;
  prefix: boolean;
}
interface LogicalExpression extends BaseExpression {
  type: "LogicalExpression";
  operator: LogicalOperator;
  left: Expression;
  right: Expression;
}
interface ConditionalExpression extends BaseExpression {
  type: "ConditionalExpression";
  test: Expression;
  alternate: Expression;
  consequent: Expression;
}
interface BaseCallExpression extends BaseExpression {
  callee: Expression | Super;
  arguments: Array<Expression | SpreadElement>;
}
type CallExpression = SimpleCallExpression | NewExpression;
interface SimpleCallExpression extends BaseCallExpression {
  type: "CallExpression";
  optional: boolean;
}
interface NewExpression extends BaseCallExpression {
  type: "NewExpression";
}
interface MemberExpression extends BaseExpression, BasePattern {
  type: "MemberExpression";
  object: Expression | Super;
  property: Expression | PrivateIdentifier;
  computed: boolean;
  optional: boolean;
}
type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | MemberExpression;
interface BasePattern extends BaseNode {}
interface SwitchCase extends BaseNode {
  type: "SwitchCase";
  test?: Expression | null | undefined;
  consequent: Statement[];
}
interface CatchClause extends BaseNode {
  type: "CatchClause";
  param: Pattern | null;
  body: BlockStatement;
}
interface Identifier extends BaseNode, BaseExpression, BasePattern {
  type: "Identifier";
  name: string;
}
type Literal = SimpleLiteral | RegExpLiteral | BigIntLiteral;
interface SimpleLiteral extends BaseNode, BaseExpression {
  type: "Literal";
  value: string | boolean | number | null;
  raw?: string | undefined;
}
interface RegExpLiteral extends BaseNode, BaseExpression {
  type: "Literal";
  value?: RegExp | null | undefined;
  regex: {
    pattern: string;
    flags: string;
  };
  raw?: string | undefined;
}
interface BigIntLiteral extends BaseNode, BaseExpression {
  type: "Literal";
  value?: bigint | null | undefined;
  bigint: string;
  raw?: string | undefined;
}
type UnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";
type BinaryOperator = "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "<<" | ">>" | ">>>" | "+" | "-" | "*" | "/" | "%" | "**" | "|" | "^" | "&" | "in" | "instanceof";
type LogicalOperator = "||" | "&&" | "??";
type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "**=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=" | "||=" | "&&=" | "??=";
type UpdateOperator = "++" | "--";
interface ForOfStatement extends BaseForXStatement {
  type: "ForOfStatement";
  await: boolean;
}
interface Super extends BaseNode {
  type: "Super";
}
interface SpreadElement extends BaseNode {
  type: "SpreadElement";
  argument: Expression;
}
interface ArrowFunctionExpression extends BaseExpression, BaseFunction {
  type: "ArrowFunctionExpression";
  expression: boolean;
  body: BlockStatement | Expression;
}
interface YieldExpression extends BaseExpression {
  type: "YieldExpression";
  argument?: Expression | null | undefined;
  delegate: boolean;
}
interface TemplateLiteral extends BaseExpression {
  type: "TemplateLiteral";
  quasis: TemplateElement[];
  expressions: Expression[];
}
interface TaggedTemplateExpression extends BaseExpression {
  type: "TaggedTemplateExpression";
  tag: Expression;
  quasi: TemplateLiteral;
}
interface TemplateElement extends BaseNode {
  type: "TemplateElement";
  tail: boolean;
  value: {
    /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */cooked?: string | null | undefined;
    raw: string;
  };
}
interface AssignmentProperty extends Property {
  value: Pattern;
  kind: "init";
  method: boolean; // false
}
interface ObjectPattern extends BasePattern {
  type: "ObjectPattern";
  properties: Array<AssignmentProperty | RestElement>;
}
interface ArrayPattern extends BasePattern {
  type: "ArrayPattern";
  elements: Array<Pattern | null>;
}
interface RestElement extends BasePattern {
  type: "RestElement";
  argument: Pattern;
}
interface AssignmentPattern extends BasePattern {
  type: "AssignmentPattern";
  left: Pattern;
  right: Expression;
}
type Class = ClassDeclaration | ClassExpression;
interface BaseClass extends BaseNode {
  superClass?: Expression | null | undefined;
  body: ClassBody;
}
interface ClassBody extends BaseNode {
  type: "ClassBody";
  body: Array<MethodDefinition | PropertyDefinition | StaticBlock>;
}
interface MethodDefinition extends BaseNode {
  type: "MethodDefinition";
  key: Expression | PrivateIdentifier;
  value: FunctionExpression;
  kind: "constructor" | "method" | "get" | "set";
  computed: boolean;
  static: boolean;
}
interface MaybeNamedClassDeclaration extends BaseClass, BaseDeclaration {
  type: "ClassDeclaration";
  /** It is null when a class declaration is a part of the `export default class` statement */
  id: Identifier | null;
}
interface ClassDeclaration extends MaybeNamedClassDeclaration {
  id: Identifier;
}
interface ClassExpression extends BaseClass, BaseExpression {
  type: "ClassExpression";
  id?: Identifier | null | undefined;
}
interface MetaProperty extends BaseExpression {
  type: "MetaProperty";
  meta: Identifier;
  property: Identifier;
}
type ModuleDeclaration = ImportDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration | ExportAllDeclaration;
interface BaseModuleDeclaration extends BaseNode {}
type ModuleSpecifier = ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier;
interface BaseModuleSpecifier extends BaseNode {
  local: Identifier;
}
interface ImportDeclaration extends BaseModuleDeclaration {
  type: "ImportDeclaration";
  specifiers: Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
  attributes: ImportAttribute[];
  source: Literal;
}
interface ImportSpecifier extends BaseModuleSpecifier {
  type: "ImportSpecifier";
  imported: Identifier | Literal;
}
interface ImportAttribute extends BaseNode {
  type: "ImportAttribute";
  key: Identifier | Literal;
  value: Literal;
}
interface ImportExpression extends BaseExpression {
  type: "ImportExpression";
  source: Expression;
  options?: Expression | null | undefined;
}
interface ImportDefaultSpecifier extends BaseModuleSpecifier {
  type: "ImportDefaultSpecifier";
}
interface ImportNamespaceSpecifier extends BaseModuleSpecifier {
  type: "ImportNamespaceSpecifier";
}
interface ExportNamedDeclaration extends BaseModuleDeclaration {
  type: "ExportNamedDeclaration";
  declaration?: Declaration | null | undefined;
  specifiers: ExportSpecifier[];
  attributes: ImportAttribute[];
  source?: Literal | null | undefined;
}
interface ExportSpecifier extends Omit<BaseModuleSpecifier, "local"> {
  type: "ExportSpecifier";
  local: Identifier | Literal;
  exported: Identifier | Literal;
}
interface ExportDefaultDeclaration extends BaseModuleDeclaration {
  type: "ExportDefaultDeclaration";
  declaration: MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression;
}
interface ExportAllDeclaration extends BaseModuleDeclaration {
  type: "ExportAllDeclaration";
  exported: Identifier | Literal | null;
  attributes: ImportAttribute[];
  source: Literal;
}
interface AwaitExpression extends BaseExpression {
  type: "AwaitExpression";
  argument: Expression;
}
//#endregion
//#region node_modules/rollup/dist/rollup.d.ts
declare module 'estree' {
  export interface Decorator extends BaseNode {
    type: 'Decorator';
    expression: Expression;
  }
  interface PropertyDefinition {
    decorators: undefined[];
  }
  interface MethodDefinition {
    decorators: undefined[];
  }
  interface BaseClass {
    decorators: undefined[];
  }
}
// utils
type NullValue = null | undefined | void;
type MaybeArray<T> = T | T[];
type MaybePromise<T> = T | Promise<T>;
type PartialNull<T> = { [P in keyof T]: T[P] | null };
interface RollupError extends RollupLog {
  name?: string;
  stack?: string;
  watchFiles?: string[];
}
interface RollupLog {
  binding?: string;
  cause?: unknown;
  code?: string;
  exporter?: string;
  frame?: string;
  hook?: string;
  id?: string;
  ids?: string[];
  loc?: {
    column: number;
    file?: string;
    line: number;
  };
  message: string;
  meta?: any;
  names?: string[];
  plugin?: string;
  pluginCode?: unknown;
  pos?: number;
  reexporter?: string;
  stack?: string;
  url?: string;
}
type LogLevel = 'warn' | 'info' | 'debug';
type LogLevelOption = LogLevel | 'silent';
type SourceMapSegment = [number] | [number, number, number, number] | [number, number, number, number, number];
interface ExistingDecodedSourceMap {
  file?: string;
  readonly mappings: SourceMapSegment[][];
  names: string[];
  sourceRoot?: string;
  sources: string[];
  sourcesContent?: string[];
  version: number;
  x_google_ignoreList?: number[];
}
interface ExistingRawSourceMap {
  file?: string;
  mappings: string;
  names: string[];
  sourceRoot?: string;
  sources: string[];
  sourcesContent?: string[];
  version: number;
  x_google_ignoreList?: number[];
}
type DecodedSourceMapOrMissing = {
  missing: true;
  plugin: string;
} | (ExistingDecodedSourceMap & {
  missing?: false;
});
interface SourceMap {
  file: string;
  mappings: string;
  names: string[];
  sources: string[];
  sourcesContent?: string[];
  version: number;
  debugId?: string;
  toString(): string;
  toUrl(): string;
}
type SourceMapInput = ExistingRawSourceMap | string | null | {
  mappings: '';
};
interface ModuleOptions {
  attributes: Record<string, string>;
  meta: CustomPluginOptions;
  moduleSideEffects: boolean | 'no-treeshake';
  syntheticNamedExports: boolean | string;
}
interface SourceDescription extends Partial<PartialNull<ModuleOptions>> {
  ast?: ProgramNode;
  code: string;
  map?: SourceMapInput;
}
interface TransformModuleJSON {
  ast?: ProgramNode;
  code: string; // note if plugins use new this.cache to opt-out auto transform cache
  customTransformCache: boolean;
  originalCode: string;
  originalSourcemap: ExistingDecodedSourceMap | null;
  sourcemapChain: DecodedSourceMapOrMissing[];
  transformDependencies: string[];
}
interface ModuleJSON extends TransformModuleJSON, ModuleOptions {
  ast: ProgramNode;
  dependencies: string[];
  id: string;
  resolvedIds: ResolvedIdMap;
  transformFiles: EmittedFile[] | undefined;
}
interface PluginCache {
  delete(id: string): boolean;
  get<T = any>(id: string): T;
  has(id: string): boolean;
  set<T = any>(id: string, value: T): void;
}
type LoggingFunction = (log: RollupLog | string | (() => RollupLog | string)) => void;
interface MinimalPluginContext {
  debug: LoggingFunction;
  error: (error: RollupError | string) => never;
  info: LoggingFunction;
  meta: PluginContextMeta;
  warn: LoggingFunction;
}
interface EmittedAsset {
  fileName?: string;
  name?: string;
  needsCodeReference?: boolean;
  originalFileName?: string | null;
  source?: string | Uint8Array;
  type: 'asset';
}
interface EmittedChunk {
  fileName?: string;
  id: string;
  implicitlyLoadedAfterOneOf?: string[];
  importer?: string;
  name?: string;
  preserveSignature?: PreserveEntrySignaturesOption;
  type: 'chunk';
}
interface EmittedPrebuiltChunk {
  code: string;
  exports?: string[];
  fileName: string;
  map?: SourceMap;
  sourcemapFileName?: string;
  type: 'prebuilt-chunk';
}
type EmittedFile = EmittedAsset | EmittedChunk | EmittedPrebuiltChunk;
type EmitFile = (emittedFile: EmittedFile) => string;
interface ModuleInfo extends ModuleOptions {
  ast: ProgramNode | null;
  code: string | null;
  dynamicImporters: readonly string[];
  dynamicallyImportedIdResolutions: readonly ResolvedId[];
  dynamicallyImportedIds: readonly string[];
  exportedBindings: Record<string, string[]> | null;
  exports: string[] | null;
  hasDefaultExport: boolean | null;
  id: string;
  implicitlyLoadedAfterOneOf: readonly string[];
  implicitlyLoadedBefore: readonly string[];
  importedIdResolutions: readonly ResolvedId[];
  importedIds: readonly string[];
  importers: readonly string[];
  isEntry: boolean;
  isExternal: boolean;
  isIncluded: boolean | null;
}
type GetModuleInfo = (moduleId: string) => ModuleInfo | null;
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style -- this is an interface so that it can be extended by plugins
interface CustomPluginOptions {
  [plugin: string]: any;
}
type LoggingFunctionWithPosition = (log: RollupLog | string | (() => RollupLog | string), pos?: number | {
  column: number;
  line: number;
}) => void;
type ParseAst = (input: string, options?: {
  allowReturnOutsideFunction?: boolean;
  jsx?: boolean;
}) => ProgramNode;
// declare AbortSignal here for environments without DOM lib or @types/node
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AbortSignal {}
}
interface PluginContext extends MinimalPluginContext {
  addWatchFile: (id: string) => void;
  cache: PluginCache;
  debug: LoggingFunction;
  emitFile: EmitFile;
  error: (error: RollupError | string) => never;
  fs: RollupFsModule;
  getFileName: (fileReferenceId: string) => string;
  getModuleIds: () => IterableIterator<string>;
  getModuleInfo: GetModuleInfo;
  getWatchFiles: () => string[];
  info: LoggingFunction;
  load: (options: {
    id: string;
    resolveDependencies?: boolean;
  } & Partial<PartialNull<ModuleOptions>>) => Promise<ModuleInfo>;
  parse: ParseAst;
  resolve: (source: string, importer?: string, options?: {
    attributes?: Record<string, string>;
    custom?: CustomPluginOptions;
    isEntry?: boolean;
    skipSelf?: boolean;
  }) => Promise<ResolvedId | null>;
  setAssetSource: (assetReferenceId: string, source: string | Uint8Array) => void;
  warn: LoggingFunction;
}
interface PluginContextMeta {
  rollupVersion: string;
  watchMode: boolean;
}
type StringOrRegExp = string | RegExp;
type StringFilter<Value = StringOrRegExp> = MaybeArray<Value> | {
  include?: MaybeArray<Value>;
  exclude?: MaybeArray<Value>;
};
interface HookFilter {
  id?: StringFilter;
  code?: StringFilter;
}
interface ResolvedId extends ModuleOptions {
  external: boolean | 'absolute';
  id: string;
  resolvedBy: string;
}
type ResolvedIdMap = Record<string, ResolvedId>;
interface PartialResolvedId extends Partial<PartialNull<ModuleOptions>> {
  external?: boolean | 'absolute' | 'relative';
  id: string;
  resolvedBy?: string;
}
type ResolveIdResult = string | NullValue | false | PartialResolvedId;
type ResolveIdHook = (this: PluginContext, source: string, importer: string | undefined, options: {
  attributes: Record<string, string>;
  custom?: CustomPluginOptions;
  isEntry: boolean;
}) => ResolveIdResult;
type ShouldTransformCachedModuleHook = (this: PluginContext, options: {
  ast: ProgramNode;
  code: string;
  id: string;
  meta: CustomPluginOptions;
  moduleSideEffects: boolean | 'no-treeshake';
  resolvedSources: ResolvedIdMap;
  syntheticNamedExports: boolean | string;
}) => boolean | NullValue;
type IsExternal = (source: string, importer: string | undefined, isResolved: boolean) => boolean;
type HasModuleSideEffects = (id: string, external: boolean) => boolean;
type LoadResult = SourceDescription | string | NullValue;
type LoadHook = (this: PluginContext, id: string) => LoadResult;
interface TransformPluginContext extends PluginContext {
  debug: LoggingFunctionWithPosition;
  error: (error: RollupError | string, pos?: number | {
    column: number;
    line: number;
  }) => never;
  getCombinedSourcemap: () => SourceMap;
  info: LoggingFunctionWithPosition;
  warn: LoggingFunctionWithPosition;
}
type TransformResult = string | NullValue | Partial<SourceDescription>;
type TransformHook = (this: TransformPluginContext, code: string, id: string) => TransformResult;
type ModuleParsedHook = (this: PluginContext, info: ModuleInfo) => void;
type RenderChunkHook = (this: PluginContext, code: string, chunk: RenderedChunk, options: NormalizedOutputOptions, meta: {
  chunks: Record<string, RenderedChunk>;
}) => {
  code: string;
  map?: SourceMapInput;
} | string | NullValue;
type ResolveDynamicImportHook = (this: PluginContext, specifier: string | AstNode, importer: string, options: {
  attributes: Record<string, string>;
}) => ResolveIdResult;
type ResolveImportMetaHook = (this: PluginContext, property: string | null, options: {
  chunkId: string;
  format: InternalModuleFormat;
  moduleId: string;
}) => string | NullValue;
type ResolveFileUrlHook = (this: PluginContext, options: {
  chunkId: string;
  fileName: string;
  format: InternalModuleFormat;
  moduleId: string;
  referenceId: string;
  relativePath: string;
}) => string | NullValue;
type AddonHookFunction = (this: PluginContext, chunk: RenderedChunk) => string | Promise<string>;
type AddonHook = string | AddonHookFunction;
type ChangeEvent = 'create' | 'update' | 'delete';
type WatchChangeHook = (this: PluginContext, id: string, change: {
  event: ChangeEvent;
}) => void;
type OutputBundle = Record<string, OutputAsset | OutputChunk>;
type PreRenderedChunkWithFileName = PreRenderedChunk & {
  fileName: string;
};
interface ImportedInternalChunk {
  type: 'internal';
  fileName: string;
  resolvedImportPath: string;
  chunk: PreRenderedChunk;
}
interface ImportedExternalChunk {
  type: 'external';
  fileName: string;
  resolvedImportPath: string;
}
type DynamicImportTargetChunk = ImportedInternalChunk | ImportedExternalChunk;
interface FunctionPluginHooks {
  augmentChunkHash: (this: PluginContext, chunk: RenderedChunk) => string | void;
  buildEnd: (this: PluginContext, error?: Error) => void;
  buildStart: (this: PluginContext, options: NormalizedInputOptions) => void;
  closeBundle: (this: PluginContext, error?: Error) => void;
  closeWatcher: (this: PluginContext) => void;
  generateBundle: (this: PluginContext, options: NormalizedOutputOptions, bundle: OutputBundle, isWrite: boolean) => void;
  load: LoadHook;
  moduleParsed: ModuleParsedHook;
  onLog: (this: MinimalPluginContext, level: LogLevel, log: RollupLog) => boolean | NullValue;
  options: (this: MinimalPluginContext, options: InputOptions) => InputOptions | NullValue;
  outputOptions: (this: PluginContext, options: OutputOptions) => OutputOptions | NullValue;
  renderChunk: RenderChunkHook;
  renderDynamicImport: (this: PluginContext, options: {
    customResolution: string | null;
    format: InternalModuleFormat;
    moduleId: string;
    targetModuleId: string | null;
    chunk: PreRenderedChunkWithFileName;
    targetChunk: PreRenderedChunkWithFileName | null;
    getTargetChunkImports: () => DynamicImportTargetChunk[] | null;
  }) => {
    left: string;
    right: string;
  } | NullValue;
  renderError: (this: PluginContext, error?: Error) => void;
  renderStart: (this: PluginContext, outputOptions: NormalizedOutputOptions, inputOptions: NormalizedInputOptions) => void;
  resolveDynamicImport: ResolveDynamicImportHook;
  resolveFileUrl: ResolveFileUrlHook;
  resolveId: ResolveIdHook;
  resolveImportMeta: ResolveImportMetaHook;
  shouldTransformCachedModule: ShouldTransformCachedModuleHook;
  transform: TransformHook;
  watchChange: WatchChangeHook;
  writeBundle: (this: PluginContext, options: NormalizedOutputOptions, bundle: OutputBundle) => void;
}
type OutputPluginHooks = 'augmentChunkHash' | 'generateBundle' | 'outputOptions' | 'renderChunk' | 'renderDynamicImport' | 'renderError' | 'renderStart' | 'resolveFileUrl' | 'resolveImportMeta' | 'writeBundle';
type SyncPluginHooks = 'augmentChunkHash' | 'onLog' | 'outputOptions' | 'renderDynamicImport' | 'resolveFileUrl' | 'resolveImportMeta';
type AsyncPluginHooks = Exclude<keyof FunctionPluginHooks, SyncPluginHooks>;
type FirstPluginHooks = 'load' | 'renderDynamicImport' | 'resolveDynamicImport' | 'resolveFileUrl' | 'resolveId' | 'resolveImportMeta' | 'shouldTransformCachedModule';
type SequentialPluginHooks = 'augmentChunkHash' | 'generateBundle' | 'onLog' | 'options' | 'outputOptions' | 'renderChunk' | 'transform';
type ParallelPluginHooks = Exclude<keyof FunctionPluginHooks | AddonHooks, FirstPluginHooks | SequentialPluginHooks>;
type AddonHooks = 'banner' | 'footer' | 'intro' | 'outro';
type MakeAsync<Function_> = Function_ extends ((this: infer This, ...parameters: infer Arguments) => infer Return) ? (this: This, ...parameters: Arguments) => Return | Promise<Return> : never; // eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectHook<T, O = {}> = T | ({
  handler: T;
  order?: 'pre' | 'post' | null;
} & O);
type HookFilterExtension<K extends keyof FunctionPluginHooks> = K extends 'transform' ? {
  filter?: HookFilter;
} : K extends 'load' ? {
  filter?: Pick<HookFilter, 'id'>;
} : K extends 'resolveId' ? {
  filter?: {
    id?: StringFilter<RegExp>;
  };
} : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
{};
type PluginHooks = { [K in keyof FunctionPluginHooks]: ObjectHook<K extends AsyncPluginHooks ? MakeAsync<FunctionPluginHooks[K]> : FunctionPluginHooks[K], // eslint-disable-next-line @typescript-eslint/no-empty-object-type
HookFilterExtension<K> & (K extends ParallelPluginHooks ? {
  sequential?: boolean;
} : {})> };
interface OutputPlugin extends Partial<{ [K in OutputPluginHooks]: PluginHooks[K] }>, Partial<Record<AddonHooks, ObjectHook<AddonHook>>> {
  cacheKey?: string;
  name: string;
  version?: string;
}
interface Plugin<A = any> extends OutputPlugin, Partial<PluginHooks> {
  // for inter-plugin communication
  api?: A;
}
type JsxPreset = 'react' | 'react-jsx' | 'preserve' | 'preserve-react';
type NormalizedJsxOptions = NormalizedJsxPreserveOptions | NormalizedJsxClassicOptions | NormalizedJsxAutomaticOptions;
interface NormalizedJsxPreserveOptions {
  factory: string | null;
  fragment: string | null;
  importSource: string | null;
  mode: 'preserve';
}
interface NormalizedJsxClassicOptions {
  factory: string;
  fragment: string;
  importSource: string | null;
  mode: 'classic';
}
interface NormalizedJsxAutomaticOptions {
  factory: string;
  importSource: string | null;
  jsxImportSource: string;
  mode: 'automatic';
}
type JsxOptions = Partial<NormalizedJsxOptions> & {
  preset?: JsxPreset;
};
type TreeshakingPreset = 'smallest' | 'safest' | 'recommended';
interface NormalizedTreeshakingOptions {
  annotations: boolean;
  correctVarValueBeforeDeclaration: boolean;
  manualPureFunctions: readonly string[];
  moduleSideEffects: HasModuleSideEffects;
  propertyReadSideEffects: boolean | 'always';
  tryCatchDeoptimization: boolean;
  unknownGlobalSideEffects: boolean;
}
interface TreeshakingOptions extends Partial<Omit<NormalizedTreeshakingOptions, 'moduleSideEffects'>> {
  moduleSideEffects?: ModuleSideEffectsOption;
  preset?: TreeshakingPreset;
}
interface ManualChunkMeta {
  getModuleIds: () => IterableIterator<string>;
  getModuleInfo: GetModuleInfo;
}
type GetManualChunk = (id: string, meta: ManualChunkMeta) => string | NullValue;
type ExternalOption = (string | RegExp)[] | string | RegExp | ((source: string, importer: string | undefined, isResolved: boolean) => boolean | NullValue);
type GlobalsOption = Record<string, string> | ((name: string) => string);
type InputOption = string | string[] | Record<string, string>;
type ManualChunksOption = Record<string, string[]> | GetManualChunk;
type LogHandlerWithDefault = (level: LogLevel, log: RollupLog, defaultHandler: LogOrStringHandler) => void;
type LogOrStringHandler = (level: LogLevel | 'error', log: RollupLog | string) => void;
type LogHandler = (level: LogLevel, log: RollupLog) => void;
type ModuleSideEffectsOption = boolean | 'no-external' | string[] | HasModuleSideEffects;
type PreserveEntrySignaturesOption = false | 'strict' | 'allow-extension' | 'exports-only';
type SourcemapPathTransformOption = (relativeSourcePath: string, sourcemapPath: string) => string;
type SourcemapIgnoreListOption = (relativeSourcePath: string, sourcemapPath: string) => boolean;
type InputPluginOption = MaybePromise<Plugin | NullValue | false | InputPluginOption[]>;
interface InputOptions {
  cache?: boolean | RollupCache;
  context?: string;
  experimentalCacheExpiry?: number;
  experimentalLogSideEffects?: boolean;
  external?: ExternalOption;
  fs?: RollupFsModule;
  input?: InputOption;
  jsx?: false | JsxPreset | JsxOptions;
  logLevel?: LogLevelOption;
  makeAbsoluteExternalsRelative?: boolean | 'ifRelativeSource';
  maxParallelFileOps?: number;
  moduleContext?: ((id: string) => string | NullValue) | Record<string, string>;
  onLog?: LogHandlerWithDefault;
  onwarn?: WarningHandlerWithDefault;
  perf?: boolean;
  plugins?: InputPluginOption;
  preserveEntrySignatures?: PreserveEntrySignaturesOption;
  preserveSymlinks?: boolean;
  shimMissingExports?: boolean;
  strictDeprecations?: boolean;
  treeshake?: boolean | TreeshakingPreset | TreeshakingOptions;
  watch?: WatcherOptions | false;
}
interface NormalizedInputOptions {
  cache: false | undefined | RollupCache;
  context: string;
  experimentalCacheExpiry: number;
  experimentalLogSideEffects: boolean;
  external: IsExternal;
  fs: RollupFsModule;
  input: string[] | Record<string, string>;
  jsx: false | NormalizedJsxOptions;
  logLevel: LogLevelOption;
  makeAbsoluteExternalsRelative: boolean | 'ifRelativeSource';
  maxParallelFileOps: number;
  moduleContext: (id: string) => string;
  onLog: LogHandler;
  perf: boolean;
  plugins: Plugin[];
  preserveEntrySignatures: PreserveEntrySignaturesOption;
  preserveSymlinks: boolean;
  shimMissingExports: boolean;
  strictDeprecations: boolean;
  treeshake: false | NormalizedTreeshakingOptions;
}
type InternalModuleFormat = 'amd' | 'cjs' | 'es' | 'iife' | 'system' | 'umd';
type ImportAttributesKey = 'with' | 'assert';
type ModuleFormat = InternalModuleFormat | 'commonjs' | 'esm' | 'module' | 'systemjs';
type GeneratedCodePreset = 'es5' | 'es2015';
interface NormalizedGeneratedCodeOptions {
  arrowFunctions: boolean;
  constBindings: boolean;
  objectShorthand: boolean;
  reservedNamesAsProps: boolean;
  symbols: boolean;
}
interface GeneratedCodeOptions extends Partial<NormalizedGeneratedCodeOptions> {
  preset?: GeneratedCodePreset;
}
type OptionsPaths = Record<string, string> | ((id: string) => string);
type InteropType = 'compat' | 'auto' | 'esModule' | 'default' | 'defaultOnly';
type GetInterop = (id: string | null) => InteropType;
type AmdOptions = ({
  autoId?: false;
  id: string;
} | {
  autoId: true;
  basePath?: string;
  id?: undefined;
} | {
  autoId?: false;
  id?: undefined;
}) & {
  define?: string;
  forceJsExtensionForImports?: boolean;
};
type NormalizedAmdOptions = ({
  autoId: false;
  id?: string;
} | {
  autoId: true;
  basePath: string;
}) & {
  define: string;
  forceJsExtensionForImports: boolean;
};
type AddonFunction = (chunk: RenderedChunk) => string | Promise<string>;
type OutputPluginOption = MaybePromise<OutputPlugin | NullValue | false | OutputPluginOption[]>;
type HashCharacters = 'base64' | 'base36' | 'hex';
interface OutputOptions {
  amd?: AmdOptions;
  assetFileNames?: string | ((chunkInfo: PreRenderedAsset) => string);
  banner?: string | AddonFunction;
  chunkFileNames?: string | ((chunkInfo: PreRenderedChunk) => string);
  compact?: boolean; // only required for bundle.write
  dir?: string;
  dynamicImportInCjs?: boolean;
  entryFileNames?: string | ((chunkInfo: PreRenderedChunk) => string);
  esModule?: boolean | 'if-default-prop';
  experimentalMinChunkSize?: number;
  exports?: 'default' | 'named' | 'none' | 'auto';
  extend?: boolean;
  /** @deprecated Use "externalImportAttributes" instead. */
  externalImportAssertions?: boolean;
  externalImportAttributes?: boolean;
  externalLiveBindings?: boolean; // only required for bundle.write
  file?: string;
  footer?: string | AddonFunction;
  format?: ModuleFormat;
  freeze?: boolean;
  generatedCode?: GeneratedCodePreset | GeneratedCodeOptions;
  globals?: GlobalsOption;
  hashCharacters?: HashCharacters;
  hoistTransitiveImports?: boolean;
  importAttributesKey?: ImportAttributesKey;
  indent?: string | boolean;
  inlineDynamicImports?: boolean;
  interop?: InteropType | GetInterop;
  intro?: string | AddonFunction;
  manualChunks?: ManualChunksOption;
  minifyInternalExports?: boolean;
  name?: string;
  noConflict?: boolean;
  outro?: string | AddonFunction;
  paths?: OptionsPaths;
  plugins?: OutputPluginOption;
  preserveModules?: boolean;
  preserveModulesRoot?: string;
  reexportProtoFromExternal?: boolean;
  sanitizeFileName?: boolean | ((fileName: string) => string);
  sourcemap?: boolean | 'inline' | 'hidden';
  sourcemapBaseUrl?: string;
  sourcemapExcludeSources?: boolean;
  sourcemapFile?: string;
  sourcemapFileNames?: string | ((chunkInfo: PreRenderedChunk) => string);
  sourcemapIgnoreList?: boolean | SourcemapIgnoreListOption;
  sourcemapPathTransform?: SourcemapPathTransformOption;
  sourcemapDebugIds?: boolean;
  strict?: boolean;
  systemNullSetters?: boolean;
  validate?: boolean;
  virtualDirname?: string;
}
interface NormalizedOutputOptions {
  amd: NormalizedAmdOptions;
  assetFileNames: string | ((chunkInfo: PreRenderedAsset) => string);
  banner: AddonFunction;
  chunkFileNames: string | ((chunkInfo: PreRenderedChunk) => string);
  compact: boolean;
  dir: string | undefined;
  dynamicImportInCjs: boolean;
  entryFileNames: string | ((chunkInfo: PreRenderedChunk) => string);
  esModule: boolean | 'if-default-prop';
  experimentalMinChunkSize: number;
  exports: 'default' | 'named' | 'none' | 'auto';
  extend: boolean;
  /** @deprecated Use "externalImportAttributes" instead. */
  externalImportAssertions: boolean;
  externalImportAttributes: boolean;
  externalLiveBindings: boolean;
  file: string | undefined;
  footer: AddonFunction;
  format: InternalModuleFormat;
  freeze: boolean;
  generatedCode: NormalizedGeneratedCodeOptions;
  globals: GlobalsOption;
  hashCharacters: HashCharacters;
  hoistTransitiveImports: boolean;
  importAttributesKey: ImportAttributesKey;
  indent: true | string;
  inlineDynamicImports: boolean;
  interop: GetInterop;
  intro: AddonFunction;
  manualChunks: ManualChunksOption;
  minifyInternalExports: boolean;
  name: string | undefined;
  noConflict: boolean;
  outro: AddonFunction;
  paths: OptionsPaths;
  plugins: OutputPlugin[];
  preserveModules: boolean;
  preserveModulesRoot: string | undefined;
  reexportProtoFromExternal: boolean;
  sanitizeFileName: (fileName: string) => string;
  sourcemap: boolean | 'inline' | 'hidden';
  sourcemapBaseUrl: string | undefined;
  sourcemapExcludeSources: boolean;
  sourcemapFile: string | undefined;
  sourcemapFileNames: string | ((chunkInfo: PreRenderedChunk) => string) | undefined;
  sourcemapIgnoreList: SourcemapIgnoreListOption;
  sourcemapPathTransform: SourcemapPathTransformOption | undefined;
  sourcemapDebugIds: boolean;
  strict: boolean;
  systemNullSetters: boolean;
  validate: boolean;
  virtualDirname: string;
}
type WarningHandlerWithDefault = (warning: RollupLog, defaultHandler: LoggingFunction) => void;
interface PreRenderedAsset {
  /** @deprecated Use "names" instead. */
  name: string | undefined;
  names: string[];
  /** @deprecated Use "originalFileNames" instead. */
  originalFileName: string | null;
  originalFileNames: string[];
  source: string | Uint8Array;
  type: 'asset';
}
interface OutputAsset extends PreRenderedAsset {
  fileName: string;
  needsCodeReference: boolean;
}
interface RenderedModule {
  readonly code: string | null;
  originalLength: number;
  removedExports: string[];
  renderedExports: string[];
  renderedLength: number;
}
interface PreRenderedChunk {
  exports: string[];
  facadeModuleId: string | null;
  isDynamicEntry: boolean;
  isEntry: boolean;
  isImplicitEntry: boolean;
  moduleIds: string[];
  name: string;
  type: 'chunk';
}
interface RenderedChunk extends PreRenderedChunk {
  dynamicImports: string[];
  fileName: string;
  implicitlyLoadedBefore: string[];
  importedBindings: Record<string, string[]>;
  imports: string[];
  modules: Record<string, RenderedModule>;
  referencedFiles: string[];
}
interface OutputChunk extends RenderedChunk {
  code: string;
  map: SourceMap | null;
  sourcemapFileName: string | null;
  preliminaryFileName: string;
}
type SerializablePluginCache = Record<string, [number, any]>;
interface RollupCache {
  modules: ModuleJSON[];
  plugins?: Record<string, SerializablePluginCache>;
}
interface RollupOptions extends InputOptions {
  // This is included for compatibility with config files but ignored by rollup.rollup
  output?: OutputOptions | OutputOptions[];
}
interface ChokidarOptions {
  alwaysStat?: boolean;
  atomic?: boolean | number;
  awaitWriteFinish?: {
    pollInterval?: number;
    stabilityThreshold?: number;
  } | boolean;
  binaryInterval?: number;
  cwd?: string;
  depth?: number;
  disableGlobbing?: boolean;
  followSymlinks?: boolean;
  ignoreInitial?: boolean;
  ignorePermissionErrors?: boolean;
  ignored?: any;
  interval?: number;
  persistent?: boolean;
  useFsEvents?: boolean;
  usePolling?: boolean;
}
interface WatcherOptions {
  allowInputInsideOutputPath?: boolean;
  buildDelay?: number;
  chokidar?: ChokidarOptions;
  clearScreen?: boolean;
  exclude?: string | RegExp | (string | RegExp)[];
  include?: string | RegExp | (string | RegExp)[];
  skipWrite?: boolean;
  onInvalidate?: (id: string) => void;
}
interface AstNodeLocation {
  end: number;
  start: number;
}
type OmittedEstreeKeys = 'loc' | 'range' | 'leadingComments' | 'trailingComments' | 'innerComments' | 'comments';
type RollupAstNode<T> = Omit<T, OmittedEstreeKeys> & AstNodeLocation;
type ProgramNode = RollupAstNode<Program>;
type AstNode = RollupAstNode<Node>;
interface RollupFsModule {
  appendFile(path: string, data: string | Uint8Array, options?: {
    encoding?: BufferEncoding | null;
    mode?: string | number;
    flag?: string | number;
  }): Promise<void>;
  copyFile(source: string, destination: string, mode?: string | number): Promise<void>;
  mkdir(path: string, options?: {
    recursive?: boolean;
    mode?: string | number;
  }): Promise<void>;
  mkdtemp(prefix: string): Promise<string>;
  readdir(path: string, options?: {
    withFileTypes?: false;
  }): Promise<string[]>;
  readdir(path: string, options?: {
    withFileTypes: true;
  }): Promise<RollupDirectoryEntry[]>;
  readFile(path: string, options?: {
    encoding?: null;
    flag?: string | number;
    signal?: AbortSignal;
  }): Promise<Uint8Array>;
  readFile(path: string, options?: {
    encoding: BufferEncoding;
    flag?: string | number;
    signal?: AbortSignal;
  }): Promise<string>;
  realpath(path: string): Promise<string>;
  rename(oldPath: string, newPath: string): Promise<void>;
  rmdir(path: string, options?: {
    recursive?: boolean;
  }): Promise<void>;
  stat(path: string): Promise<RollupFileStats>;
  lstat(path: string): Promise<RollupFileStats>;
  unlink(path: string): Promise<void>;
  writeFile(path: string, data: string | Uint8Array, options?: {
    encoding?: BufferEncoding | null;
    mode?: string | number;
    flag?: string | number;
  }): Promise<void>;
}
type BufferEncoding = 'ascii' | 'utf8' | 'utf16le' | 'ucs2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';
interface RollupDirectoryEntry {
  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
  name: string;
}
interface RollupFileStats {
  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
  size: number;
  mtime: Date;
  ctime: Date;
  atime: Date;
  birthtime: Date;
}
//#endregion
export { RollupOptions };