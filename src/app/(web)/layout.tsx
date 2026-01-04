import FrontLayout from "@/layouts/front-stage/front-layout"
import { PropsWithChildren } from "react"

const Layout = ({ children }: PropsWithChildren) => {
  return <FrontLayout>{children}</FrontLayout>
}

export default Layout
