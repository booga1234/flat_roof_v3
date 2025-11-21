import Pipeline from './Pipeline'
import NewPage from '../components/NewPage'
import PageHeader from '../components/PageHeader'

function Home() {
  return (
    <NewPage>
      <PageHeader />
      <Pipeline />
    </NewPage>
  )
}

export default Home

