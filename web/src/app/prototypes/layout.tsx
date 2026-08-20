import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "G_Cloister - Landing prototypes",
  description:
    "Alternative landing page directions for G_Cloister, private file rooms on your own Google Drive.",
};

export default function PrototypesLayout({ children }: { children: React.ReactNode }) {
  return children;
}