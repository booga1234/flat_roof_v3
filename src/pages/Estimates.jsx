import { useState } from 'react'
import NewPage from '../components/NewPage'
import PageHeader from '../components/PageHeader'
import InfoCard from '../components/InfoCard'
import { Calculator } from 'lucide-react'

function Estimates() {
  const [selectedValue, setSelectedValue] = useState('Re-roof')

  return (
    <NewPage>
      <PageHeader 
        text="Estimates"
        segmentedControlValue={selectedValue}
        onSegmentedControlChange={setSelectedValue}
      />
      <div style={{ padding: '18px' }}>
        <InfoCard
          icon={<Calculator />}
          title="Maintenance"
          dateTime="Nov 12, 09:22 PM"
          identifier="1234ST"
        />
      </div>
    </NewPage>
  )
}

export default Estimates

