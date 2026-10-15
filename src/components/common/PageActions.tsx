import type { ReactNode } from 'react';
export function PageActions({ title, children }: { title: string; children?: ReactNode }) { return <header className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-semibold">{title}</h1><div className="flex flex-wrap gap-2">{children}</div></header>; }
