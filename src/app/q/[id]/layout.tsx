export default function QLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "#f8f9fa" }}>
      {children}
    </div>
  )
}
