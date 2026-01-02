import type * as React from "react"
import { Html, Body, Container, Heading, Section, Text, Hr } from "@react-email/components"

export default function EmailLayout({
  title,
  previewText,
  children,
}: {
  title?: string
  previewText?: string
  children: React.ReactNode
}) {
  return (
    <Html>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "Inter, Arial" }}>
        {previewText ? (
          <Text style={{ display: "none", fontSize: 1, color: "transparent", height: 0, opacity: 0 }}>
            {previewText}
          </Text>
        ) : null}
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "24px auto",
            padding: 24,
            borderRadius: 12,
            maxWidth: 560,
          }}
        >
          <Heading style={{ fontSize: 24, margin: 0, color: "#7c3aed" }}>Circle</Heading>
          {title ? <Text style={{ color: "#475467", marginTop: 8, fontSize: 16 }}>{title}</Text> : null}
          <Section style={{ marginTop: 16 }}>{children}</Section>
          <Hr style={{ marginTop: 24, marginBottom: 12, borderColor: "#EAECF0" }} />
          <Text style={{ color: "#98A2B3", fontSize: 12, lineHeight: "16px" }}>
            You're receiving this transactional email because you have a Circle account. Need help? Reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
