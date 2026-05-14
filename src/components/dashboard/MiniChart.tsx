interface MiniChartProps {
  data: number[]
  color?: string
}

export function MiniChart({ data, color = 'var(--color-accent)' }: MiniChartProps) {
  const max = Math.max(...data, 1)

  return (
    <div className="flex items-end gap-[3px] h-9 mt-2">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-300"
          style={{
            height: `${Math.max((value / max) * 36, 4)}px`,
            backgroundColor: color,
            opacity: i === data.length - 1 ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  )
}
