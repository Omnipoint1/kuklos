import { Button, Text } from "@react-email/components"
import EmailLayout from "./components/EmailLayout"

export default function ConnectionAcceptedEmail({
  senderName,
  profileUrl,
}: {
  senderName: string
  profileUrl: string
}) {
  return (
    <EmailLayout
      title={`You're now connected with ${senderName}`}
      previewText="Say hello and start building your relationship"
    >
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        Great news! You're now connected with <strong>{senderName}</strong> on Circle.
      </Text>
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        It's a perfect time to say hello and start building meaningful relationships within your faith community.
      </Text>
      <Button
        href={profileUrl}
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
        View Profile
      </Button>
    </EmailLayout>
  )
}
