import dynamic from "next/dynamic";

const CardDeckManager = dynamic(
  () =>
    import("@/components/card-deck-manager").then((mod) => ({
      default: mod.CardDeckManager,
    })),
  { ssr: false },
);

export default function Home() {
  return (
    <main className="flex-1 bg-background">
      <CardDeckManager />
    </main>
  );
}
