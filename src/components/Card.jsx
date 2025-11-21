function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white border borderInput rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-[15px] flex flex-col gap-[10px] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

