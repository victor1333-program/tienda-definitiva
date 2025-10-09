import { Toaster } from 'react-hot-toast'

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="editor-layout h-screen w-screen overflow-hidden">
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}