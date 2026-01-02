import { Button, Text } from "@react-email/components"
import EmailLayout from "./components/EmailLayout"

export default function ProfileReminderEmail({
  firstName,
  percent,
  profileUrl,
}: {
  firstName?: string
  percent: number
  profileUrl: string
}) {
  return (
    <EmailLayout title="Complete your Circle profile" previewText={`You're ${percent}% done`}>
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        {firstName ? `${firstName}, y` : "Y"}our Circle profile is <strong>{percent}% complete</strong>.
      </Text>
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        Add your ministry experience, spiritual gifts, and interests to help others in your faith community discover and
        connect with you.
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
        Complete Your Profile
      </Button>
    </EmailLayout>
  )
}
