
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume-service";

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#222222",
    lineHeight: 1.5,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#172554",
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 8,
  },
  contact: {
    fontSize: 9,
    color: "#475569",
    marginBottom: 16,
  },
  section: {
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1d4ed8",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 3,
    marginBottom: 7,
  },
  itemTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  muted: {
    color: "#64748b",
    fontSize: 9,
  },
  paragraph: {
    marginTop: 3,
    fontSize: 9,
  },
  bullet: {
    marginLeft: 8,
    fontSize: 9,
    marginTop: 2,
  },
});

type Props = {
  data: ResumeData;
};

export default function ResumePDFDocument({ data }: Props) {
  const personal = data.personal;

  const contactDetails = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.website,
  ].filter(Boolean);

  return (
    <Document
      title={`${personal.fullName || "Resume"} - Resume`}
      author={personal.fullName || "CareerCraft"}
    >
      <Page size="A4" style={styles.page} wrap>
        <View>
          <Text style={styles.name}>
            {personal.fullName || "Your Name"}
          </Text>

          {personal.jobTitle ? (
            <Text style={styles.jobTitle}>
              {personal.jobTitle}
            </Text>
          ) : null}

          <Text style={styles.contact}>
            {contactDetails.join("  |  ")}
          </Text>
        </View>

        {data.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              PROFESSIONAL SUMMARY
            </Text>
            <Text>{data.summary}</Text>
          </View>
        ) : null}

        {data.experiences.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              WORK EXPERIENCE
            </Text>

            {data.experiences.map((item) => (
              <View key={item.id} style={{ marginBottom: 9 }}>
                <Text style={styles.itemTitle}>
                  {item.position || "Position"}
                  {item.company ? ` | ${item.company}` : ""}
                </Text>

                <Text style={styles.muted}>
                  {[item.location, item.startDate, item.endDate]
                    .filter(Boolean)
                    .join("  |  ")}
                </Text>

                {item.description ? (
                  <Text style={styles.paragraph}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.educations.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              EDUCATION
            </Text>

            {data.educations.map((item) => (
              <View key={item.id} style={{ marginBottom: 8 }}>
                <Text style={styles.itemTitle}>
                  {item.school || "School"}
                </Text>

                <Text>
                  {[item.degree, item.field]
                    .filter(Boolean)
                    .join(" - ")}
                </Text>

                <Text style={styles.muted}>
                  {[item.startDate, item.endDate]
                    .filter(Boolean)
                    .join("  |  ")}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.skills ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              SKILLS
            </Text>
            <Text>{data.skills}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
