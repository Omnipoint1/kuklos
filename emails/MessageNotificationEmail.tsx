import { Button, Text } from "@react-email/components"
import EmailLayout from "./components/EmailLayout"

export default function MessageNotificationEmail({
  senderName,
  snippet,
  threadUrl,
}: {
  senderName: string
  snippet: string
  threadUrl: string
}) {
  return (
    <EmailLayout title={`New message from ${senderName}`} previewText={snippet}>
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        <strong>{senderName}</strong> sent you a message:
      </Text>
      <Text
        style={{
          fontSize: 16,
          lineHeight: "24px",
          margin: "16px 0",
          padding: "12px",
          backgroundColor: "#f8fafc",
          borderRadius: 8,
          fontStyle: "italic",
        }}
      >
        "{snippet}"
      </Text>
      <Button
        href={threadUrl}
        style={{
          backgroundColor: "#7c3aed",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: 8,
          textDecoration: "none",
          display: "inline-block",
          fontWeight: "500",
        }}
      >
        Reply to Message
      </Button>
    </EmailLayout>
  )
}
