import Button from '../components/Button'
import LabelText from '../components/LabelText'
import Input from '../components/Input'
import Card from '../components/Card'
import Select from '../components/Select'

function Components() {
  const categories = [
    'Buttons',
    'Inputs',
    'Cards',
    'Text'
  ]

  const renderCategoryContent = (category) => {
    switch (category) {
      case 'Buttons':
        return (
          <div className="mt-4 flex flex-col items-start gap-4">
            <Button variant="dark">Button</Button>
            <Button variant="white">Button</Button>
          </div>
        )
      case 'Inputs':
        return (
          <div className="mt-4 flex flex-col items-start gap-4">
            <Input label={<LabelText>Name</LabelText>} />
            <Select
              label={<LabelText>Reasoning effort</LabelText>}
              options={[
                { value: 'minimal', label: 'minimal' },
                { value: 'low', label: 'low' },
                { value: 'medium', label: 'medium' },
                { value: 'high', label: 'high' },
              ]}
              value="low"
            />
          </div>
        )
      case 'Cards':
        return (
          <div className="mt-4 flex flex-col items-start gap-4">
            <Card className="w-[300px] h-[200px]" />
          </div>
        )
      case 'Text':
        return (
          <div className="mt-4 flex flex-col items-start gap-4">
            <LabelText>Label Text</LabelText>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-fg mb-8">
            Component Library
          </h1>

          <div className="space-y-0">
            {categories.map((category, index) => (
              <div key={category}>
                <div className="py-8">
                  <h2 className="text-2xl font-semibold text-fg mb-4">
                    {category}
                  </h2>
                  {renderCategoryContent(category)}
                </div>
                {index < categories.length - 1 && (
                  <div className="h-px border-t border-border w-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Components

