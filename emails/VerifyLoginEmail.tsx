import { Button, Text } from "@react-email/components"
import EmailLayout from "./components/EmailLayout"

export default function VerifyLoginEmail({ url }: { url: string }) {
  return (
    <EmailLayout title="Sign in to Circle" previewText="Use your secure magic link to sign in">
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        Click the button below to finish signing in. This link expires in 60 minutes.
      </Text>
      <Button
        href={url}
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
        Sign in to Circle
      </Button>
      <Text style={{ color: "#667085", fontSize: 14, marginTop: 16 }}>
        If you didn't request this, you can safely ignore this email.
      </Text>
    </EmailLayout>
  )
}
