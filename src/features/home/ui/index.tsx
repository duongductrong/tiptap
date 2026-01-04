"use client"

import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import Link from "next/link"
import PartialEditor from "../components/partial-editor"
import PartialIntroduction from "../components/partial-introduction"

export interface HomeProps { }

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <PartialIntroduction />
        <PartialEditor />
      </main>
    </div>
  )
}

export default Home
