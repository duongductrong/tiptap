import { PropsWithChildren } from "react"
import FrontContent from "../../../layouts/front-tage/front-content"
import FrontFooter from "../../../layouts/front-tage/front-footer"
import FrontHeader from "../../../layouts/front-tage/front-header"

export interface FrontLayoutProps extends PropsWithChildren {}

const FrontLayout = ({ children }: FrontLayoutProps) => {
  return (
    <div>
      <FrontHeader />
      <FrontContent>{children}</FrontContent>
      <FrontFooter />
    </div>
  )
}

export default FrontLayout
