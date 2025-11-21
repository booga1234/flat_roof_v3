import SegmentedControl from './SegmentedControl'

function PageHeader({ text = 'New Page', segmentedControlValue, onSegmentedControlChange }) {
  return (
    <div
      style={{
        width: '100%',
        padding: '15px 18px',
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontFamily: 'Inter',
        fontSize: '18px',
        letterSpacing: '-0.01em',
        fontWeight: '500',
        color: '#000000',
      }}
    >
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

