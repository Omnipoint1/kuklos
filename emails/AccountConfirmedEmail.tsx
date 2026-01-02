import { Button, Text } from "@react-email/components"
import EmailLayout from "./components/EmailLayout"

export default function AccountConfirmedEmail({ firstName }: { firstName?: string }) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  return (
    <EmailLayout title="Your account is ready" previewText="Start exploring your faith community">
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        {firstName ? `${firstName}, y` : "Y"}our Circle account is confirmed and ready to use! Start exploring your feed
        and connecting with others in your faith community.
      </Text>
      <Button
        href={baseUrl}
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
        Explore Circle
      </Button>
    </EmailLayout>
  )
}
