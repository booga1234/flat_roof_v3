import LabelText from './LabelText'

function Textarea({ label, placeholder = 'Enter text', className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-2 items-start ${className}`}>
      {label && (
        <label className="flex">
          <LabelText>{label}</LabelText>
        </label>
      )}
      <textarea
        placeholder={placeholder}
        className="input-focus-outline flex flex-row items-start px-2 py-1.5 gap-2.5 w-full min-h-[80px] bg-white border borderInput rounded-lg outline-none focus:borderInput focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium resize-none"
        style={{
          boxSizing: 'border-box',
          textAlign: 'left',
        }}
        {...props}
      />
    </div>
  )
}

export default Textarea

