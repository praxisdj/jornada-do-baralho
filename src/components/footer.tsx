import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Construído com ❤️ para a comunidade Jovem Nerd
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/praxisdj/jornada-do-baralho"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="https://djonathan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Djonathan Krause
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="https://www.jornadadobaralho.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Jornada do Baralho, por César Hoffmann
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
