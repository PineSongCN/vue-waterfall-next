export interface WaterfallProps<T = Record<string, unknown>> {
    col?: number;
    width?: number;
    height?: string;
    data?: T[];
    uniqueKey?: string;
    gutterWidth?: number;
    isTransition?: boolean;
    lazyDistance?: number;
    loadDistance?: number;
    interactive?: boolean;
}

export interface WaterfallEmits {
    scroll: [event: ScrollEvent];
    loadMore: [];
    finish: [];
}

export interface WaterfallInstance {
    resize: (index?: number | null, elements?: HTMLElement[]) => Promise<void>;
    mix: () => void;
}

export interface ScrollEvent {
    scrollHeight: number;
    scrollTop: number;
    clientHeight: number;
    diff: number;
    time: number;
}

// 泛型 EmitFunction 类型
type EmitFunction<T, K extends keyof T> = (
    evt: K,
    ...args: T[K] extends unknown[] ? T[K] : T[K][]
) => void;

// 辅助类型：将联合类型转换为交叉类型
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never;

// 泛型 EditorEmitFunction 类型
export type VueEmit<T> = UnionToIntersection<
    {
        [K in keyof T]: EmitFunction<T, K>;
    }[keyof T]
>;
