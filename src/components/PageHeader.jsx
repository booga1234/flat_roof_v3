import SegmentedControl from './SegmentedControl'

function PageHeader({ text = 'New Page', segmentedControlValue, onSegmentedControlChange }) {
  return (
    <div className="w-full py-[15px] px-[18px] flex flex-row gap-[10px] justify-start items-center font-sans text-lg tracking-[-0.01em] font-medium text-black">
      {text}
      {segmentedControlValue !== undefined && onSegmentedControlChange && (
        <SegmentedControl 
          value={segmentedControlValue}
          onChange={onSegmentedControlChange}
        />
      )}
    </div>
  )
}

export default PageHeader

