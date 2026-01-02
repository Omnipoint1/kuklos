import { Button, Text } from "@react-email/components"
import EmailLayout from "./components/EmailLayout"

export default function ConnectionRequestEmail({
  senderName,
  senderHandle,
  acceptUrl,
}: {
  senderName: string
  senderHandle: string
  acceptUrl: string
}) {
  return (
    <EmailLayout title={`${senderName} wants to connect`} previewText="Review and accept the connection request">
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        <strong>@{senderHandle}</strong> has sent you a connection request on Circle.
      </Text>
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        Connecting with others helps grow your faith community and discover new opportunities for fellowship and
        service.
      </Text>
      <Button
        href={acceptUrl}
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
        Accept Connection
      </Button>
    </EmailLayout>
  )
}
