import type { ReactNode } from "react";
import { Modal } from "./Modal";
export function Drawer(props: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return <Modal {...props} drawer />;
}
