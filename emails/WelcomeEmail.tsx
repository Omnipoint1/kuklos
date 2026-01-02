import { Button, Text } from "@react-email/components"
import EmailLayout from "./components/EmailLayout"

export default function WelcomeEmail({ firstName }: { firstName?: string }) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  return (
    <EmailLayout
      title={`Welcome to Circle${firstName ? `, ${firstName}` : ""}!`}
      previewText="Let's set up your profile and start connecting"
    >
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        We're glad you're here! Circle is where faith communities connect, grow, and discover new opportunities
        together.
      </Text>
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        Complete your profile to start connecting with others in your faith community.
      </Text>
      <Button
        href={`${baseUrl}/onboarding`}
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
        Complete Your Profile
      </Button>
    </EmailLayout>
  )
}
