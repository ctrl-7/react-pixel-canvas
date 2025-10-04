import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Terminal, ClipboardCopy, Check } from 'lucide-react'

function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <Card className="w-full max-w-2xl p-0">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-mono">
          <Terminal className="h-4 w-4" />
          <span>{command}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          className="cursor-pointer"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <ClipboardCopy className="h-4 w-4" />
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function Demo() {
  const commands = [
    {
      title: '1. Clone the repo',
      description: 'Start by cloning the starter repository.',
      command: 'git clone https://github.com/pexeixv/shadcn-starter',
    },
    {
      title: '2. Install dependencies',
      description: 'Navigate to the project folder and install packages.',
      command: 'pnpm install',
    },
    {
      title: '3. Run the development server',
      description: 'Start your local server to begin development.',
      command: 'pnpm run dev',
    },
    {
      title: '4. Customize your project',
      description: 'Modify components, routes, and styles to build your app.',
      command: '',
      extraNote: (
        <ul className="list-disc list-inside space-y-1">
          <li>
            Edit <code>src/pages</code> to add pages.
          </li>
          <li>
            Use the <code>src/components/ui</code> folder for reusable UI components.
          </li>
          <li>Tailwind CSS is set up with JIT mode for utility-first styling.</li>
          <li>React Router handles navigation.</li>
          <li>shadcn/ui components are ready for use throughout your app.</li>
        </ul>
      ),
    },
    {
      title: '5. Build and deploy',
      description: 'When ready, build your project for production.',
      command: 'pnpm run build',
      extraNote: 'Then deploy the dist folder to your hosting provider.',
    },
  ]

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">How to use the shadcn-starter template</h1>

      {commands.map(({ title, description, command, extraNote }) => (
        <React.Fragment key={title}>
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {command ? <CopyCommand command={command} /> : null}
              {extraNote && (
                <div className={command ? 'mt-2 ml-2 text-sm text-muted-foreground' : ''}>
                  {typeof extraNote === 'string' ? <p>{extraNote}</p> : extraNote}
                </div>
              )}
            </CardContent>
          </Card>
        </React.Fragment>
      ))}
    </main>
  )
}
