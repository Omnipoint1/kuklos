import { Button, Text } from "@react-email/components"
import EmailLayout from "./components/EmailLayout"

export default function EmailChangeConfirmationEmail({
  confirmUrl,
}: {
  confirmUrl: string
}) {
  return (
    <EmailLayout title="Confirm your new email" previewText="Keep your Circle account secure">
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        Click the button below to confirm your new email address for your Circle account.
      </Text>
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        This helps keep your account secure and ensures you receive important updates from your faith community.
      </Text>
      <Button
        href={confirmUrl}
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
        Confirm New Email
      </Button>
    </EmailLayout>
  )
}
