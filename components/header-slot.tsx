"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Lets a page put something in the header (the "Your votes" control) while
// the page keeps ownership of the data behind it.
const HeaderSlotContext = createContext<{
  target: HTMLElement | null;
  setTarget: (el: HTMLElement | null) => void;
}>({ target: null, setTarget: () => {} });

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  return <HeaderSlotContext.Provider value={{ target, setTarget }}>{children}</HeaderSlotContext.Provider>;
}

/** Rendered once, inside the header, where page content should appear. */
export function HeaderSlotTarget({ className }: { className?: string }) {
  const { setTarget } = useContext(HeaderSlotContext);
  return <div ref={setTarget} className={className} />;
}

/** Rendered by a page; its children show up in the header. */
export function HeaderSlot({ children }: { children: ReactNode }) {
  const { target } = useContext(HeaderSlotContext);
  if (!target) return null;
  return createPortal(children, target);
}
