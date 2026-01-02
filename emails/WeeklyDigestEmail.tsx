import { Text, Link } from "@react-email/components"
import EmailLayout from "./components/EmailLayout"

export default function WeeklyDigestEmail({
  firstName,
  items,
}: {
  firstName?: string
  items: { type: "post" | "connection" | "mention"; title: string; url: string }[]
}) {
  return (
    <EmailLayout
      title={`This week on Circle${firstName ? `, ${firstName}` : ""}`}
      previewText="Highlights from your faith community"
    >
      <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0" }}>
        Here are the highlights from your faith community this week:
      </Text>

      {items?.length ? (
        <div style={{ margin: "20px 0" }}>
          {items.map((item, i) => (
            <div key={i} style={{ margin: "12px 0", padding: "12px", backgroundColor: "#f8fafc", borderRadius: 8 }}>
              <Link
                href={item.url}
                style={{
                  color: "#7c3aed",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontSize: 16,
                }}
              >
                {item.title}
              </Link>
              <Text style={{ fontSize: 14, color: "#667085", margin: "4px 0 0 0" }}>
                {item.type === "post" && "📝 Post"}
                {item.type === "connection" && "🤝 Connection"}
                {item.type === "mention" && "💬 Mention"}
              </Text>
            </div>
          ))}
        </div>
      ) : (
        <Text style={{ fontSize: 16, lineHeight: "24px", margin: "16px 0", color: "#667085" }}>
          No highlights this week—try posting to start conversations in your faith community.
        </Text>
      )}
    </EmailLayout>
  )
}
