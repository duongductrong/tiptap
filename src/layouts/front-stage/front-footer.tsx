import Link from "next/link"

export interface FrontFooterProps { }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FrontFooter = (props: FrontFooterProps) => {
  return (
    <footer className="border-t border-border/40 py-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 text-sm text-muted-foreground">
        <p>
          Built with{" "}
          <Link
            href="https://tiptap.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-foreground"
          >
            Tiptap
          </Link>
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/duongductrong/tiptap"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </Link>
          <Link
            href="https://tiptap.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Docs
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default FrontFooter
