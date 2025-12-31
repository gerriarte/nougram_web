"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Mail, Send } from "lucide-react"
import { useSendQuoteEmail } from "@/lib/queries"
import { useToast } from "@/hooks/use-toast"

interface SendEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
  quoteId: number
  projectName: string
  clientEmail?: string
  quoteVersion: number
}

export function SendEmailDialog({
  open,
  onOpenChange,
  projectId,
  quoteId,
  projectName,
  clientEmail,
  quoteVersion,
}: SendEmailDialogProps) {
  const { toast } = useToast()
  const sendEmailMutation = useSendQuoteEmail()
  
  const [toEmail, setToEmail] = useState(clientEmail || "")
  const [subject, setSubject] = useState(`Quote for ${projectName} - Version ${quoteVersion}`)
  const [message, setMessage] = useState("")
  const [includePDF, setIncludePDF] = useState(true)
  const [includeDOCX, setIncludeDOCX] = useState(false)

  const handleSend = async () => {
    if (!toEmail) {
      toast({
        title: "Error",
        description: "Please enter a recipient email address",
        variant: "destructive",
      })
      return
    }

    try {
      await sendEmailMutation.mutateAsync({
        projectId,
        quoteId,
        emailData: {
          to_email: toEmail,
          subject: subject || undefined,
          message: message || undefined,
          include_pdf: includePDF,
          include_docx: includeDOCX,
        },
      })

      toast({
        title: "Email sent",
        description: `Quote sent successfully to ${toEmail}`,
      })

      onOpenChange(false)
      
      // Reset form
      setToEmail(clientEmail || "")
      setSubject(`Quote for ${projectName} - Version ${quoteVersion}`)
      setMessage("")
      setIncludePDF(true)
      setIncludeDOCX(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email. Please check SMTP configuration.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Quote by Email</DialogTitle>
          <DialogDescription>
            Send this quote to the client via email. The quote will be attached as a PDF or DOCX.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="to-email">To Email *</Label>
            <Input
              id="to-email"
              type="email"
              placeholder="client@example.com"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add any additional notes or information..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-pdf"
                  checked={includePDF}
                  onChange={(e) => setIncludePDF(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="include-pdf" className="text-sm font-normal cursor-pointer">
                  Include PDF attachment
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-docx"
                  checked={includeDOCX}
                  onChange={(e) => setIncludeDOCX(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="include-docx" className="text-sm font-normal cursor-pointer">
                  Include DOCX attachment
                </Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sendEmailMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sendEmailMutation.isPending || !toEmail}
          >
            {sendEmailMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}















