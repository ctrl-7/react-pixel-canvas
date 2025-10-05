
type Props = { color: string; x: number; y: number }

const ColorTooltip = (props: Props) => {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        left: props.x,
        top: props.y,
        transform: 'translate(0, 0)',
        background: 'rgba(17,24,39,0.9)',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 12,
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: props.color,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.2) inset',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
      <span style={{ fontFamily: 'monospace' }}>{props.color.toUpperCase()}</span>
    </div>
  )
}

export default ColorTooltip
