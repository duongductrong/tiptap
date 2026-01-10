"use client"

import EditorDemo from "../components/editor-demo"
import Introduction from "../components/introduction"

export interface HomeProps {}

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Introduction />
        <EditorDemo />
      </main>
    </div>
  )
}

export default Home
