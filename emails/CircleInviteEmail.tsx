import { Button, Text } from "@react-email/components"
import EmailLayout from "./components/EmailLayout"

export default function CircleInviteEmail({
  inviterName,
  circleName,
  joinUrl,
}: {
  inviterName: string
  circleName: string
  joinUrl: string
}) {
  return (
    <EmailLayout title={`You're invited to ${circleName}`} previewText={`Join ${inviterName} in this faith community`}>
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        <strong>{inviterName}</strong> has invited you to join the <strong>"{circleName}"</strong> community on Circle.
      </Text>
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        This is a great opportunity to connect with others who share your faith and values.
      </Text>
      <Button
        href={joinUrl}
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
        Join {circleName}
      </Button>
    </EmailLayout>
  )
}
