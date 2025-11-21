import Popup from './Popup'
import Button from './Button'

function PopupForm({ 
  isOpen, 
  onClose, 
  title = 'Edit Material',
  onSave,
  saving = false,
  children 
}) {
  const handleSave = async () => {
    if (onSave) {
      await onSave()
      // Don't close if saving is in progress (onSave will handle closing on success)
      if (!saving) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="600px"
      noShadow={true}
      className="overflow-hidden"
    >
      <div 
        className="flex flex-col overflow-hidden"
        style={{ 
          maxHeight: '90vh',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Scrollable Content Area */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
          style={{ 
            flex: '1 1 auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex flex-col gap-5 p-5">
            {/* Main Header */}
            <h2
              className="text-[#000000] m-0"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                letterSpacing: '-0.01em',
                fontWeight: 600,
              }}
            >
              {title}
            </h2>

            {/* Form Content - children */}
            {children && (
              <div className="flex flex-col gap-5">
                {children}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Section */}
        <div
          className="flex flex-row justify-end gap-[5px] flex-shrink-0 border-t border-[#E6E6E6]"
          style={{
            padding: '20px',
            borderTopWidth: '1px',
            borderRightWidth: '0px',
            borderBottomWidth: '0px',
            borderLeftWidth: '0px',
            flexShrink: 0
          }}
        >
          <Button variant="white" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="dark" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Popup>
  )
}

export default PopupForm

