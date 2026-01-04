import { Fragment } from "react"
import PartialEditor from "../components/partial-editor"
import PartialIntroduction from "../components/partial-introduction"

export interface HomeProps { }

const Home = () => {
  return (
    <Fragment>
      <PartialIntroduction />
      <PartialEditor />
    </Fragment>
  )
}

export default Home
