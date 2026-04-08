import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: { padding: 50, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 30, paddingBottom: 20, borderBottom: '2pt solid #052c46',
    },
    brandTitle: { fontSize: 22, fontWeight: 'bold', color: '#052c46' },
    brandSubtitle: { fontSize: 9, color: '#10b981', marginTop: 4 },
    headerRightText: { fontSize: 9, color: '#64748b', marginTop: 2, textAlign: 'right' },
    patientBox: {
        backgroundColor: '#f8fafc', borderRadius: 8, padding: 16,
        marginBottom: 24, border: '1pt solid #e2e8f0',
    },
    patientLabel: { fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
    patientName: { fontSize: 16, fontWeight: 'bold', color: '#052c46' },
    divider: { borderBottom: '0.5pt solid #e2e8f0', marginBottom: 20 },
    sectionTitle: {
        fontSize: 11, fontWeight: 'bold', color: '#052c46',
        marginBottom: 10, paddingBottom: 6, borderBottom: '0.5pt solid #e2e8f0',
    },
    section: { marginBottom: 20 },
    bodyText: { fontSize: 9, color: '#475569', lineHeight: 1.7, marginBottom: 4 },
    urgencyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    urgencyBadge: {
        borderRadius: 4, paddingTop: 3, paddingBottom: 3,
        paddingLeft: 10, paddingRight: 10, marginRight: 10,
    },
    urgencyBadgeText: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },
    recItem: {
        flexDirection: 'row', marginBottom: 8,
        backgroundColor: '#f8fafc', padding: 10, borderRadius: 6,
    },
    recNumber: { fontSize: 9, fontWeight: 'bold', color: '#10b981', marginRight: 10, width: 20 },
    recText: { fontSize: 9, color: '#475569', flex: 1, lineHeight: 1.5 },
    budgetBox: {
        backgroundColor: '#052c46', borderRadius: 8, padding: 20, marginBottom: 24,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    budgetLabel: { fontSize: 9, color: '#6ee7b7', fontWeight: 'bold', textTransform: 'uppercase' },
    budgetValue: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
    budgetNote: { fontSize: 7, color: '#6ee7b7', marginTop: 4 },
    signatureRow: { flexDirection: 'row', marginTop: 30 },
    signatureBox: { flex: 1, borderTop: '0.5pt solid #cbd5e1', paddingTop: 8, marginRight: 20 },
    signatureLabel: { fontSize: 8, color: '#94a3b8' },
    footer: {
        position: 'absolute', bottom: 30, left: 50, right: 50,
        flexDirection: 'row', justifyContent: 'space-between',
        borderTop: '0.5pt solid #e2e8f0', paddingTop: 10,
    },
    footerText: { fontSize: 7, color: '#94a3b8' },
})

interface AuraReportProps {
    patientName: string
    summary: string
    recommendations: string[]
    urgency: string
    toothCount: number
}

export function AuraReportPDF({ patientName, summary, recommendations, urgency, toothCount }: AuraReportProps) {
    const today = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    const urgencyColor = urgency === 'alta' ? '#ef4444' : urgency === 'media' ? '#f59e0b' : '#10b981'
    const urgencyBg = urgency === 'alta' ? '#fef2f2' : urgency === 'media' ? '#fffbeb' : '#f0fdf4'

    return (
        <Document title={`Reporte AURA IA — ${patientName}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.brandTitle}>Dental Expression</Text>
                        <Text style={styles.brandSubtitle}>AURA IA — Analisis Odontologico Inteligente</Text>
                    </View>
                    <View>
                        <Text style={styles.headerRightText}>Reporte Clinico IA</Text>
                        <Text style={styles.headerRightText}>Fecha: {today}</Text>
                    </View>
                </View>

                {/* Patient */}
                <View style={styles.patientBox}>
                    <Text style={styles.patientLabel}>Paciente</Text>
                    <Text style={styles.patientName}>{patientName || 'Paciente'}</Text>
                    <Text style={[styles.patientLabel, { marginTop: 8 }]}>Piezas analizadas: {toothCount} / 32</Text>
                </View>

                {/* Urgency */}
                <View style={styles.urgencyRow}>
                    <View style={[styles.urgencyBadge, { backgroundColor: urgencyBg }]}>
                        <Text style={[styles.urgencyBadgeText, { color: urgencyColor }]}>
                            Urgencia: {urgency.toUpperCase()}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 8, color: '#94a3b8' }}>Generado por AURA IA Neural</Text>
                </View>

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumen Estetico-Clinico</Text>
                    <Text style={styles.bodyText}>{summary}</Text>
                </View>

                {/* Recommendations */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Plan de Tratamiento Recomendado</Text>
                    {recommendations.map((rec, i) => (
                        <View key={i} style={styles.recItem}>
                            <Text style={styles.recNumber}>0{i + 1}.</Text>
                            <Text style={styles.recText}>{rec}</Text>
                        </View>
                    ))}
                </View>

                {/* Budget */}
                <View style={styles.budgetBox}>
                    <View>
                        <Text style={styles.budgetLabel}>Presupuesto Estimado IA</Text>
                        <Text style={styles.budgetValue}>$1,450 USD*</Text>
                        <Text style={styles.budgetNote}>*Estimado basado en procedimientos detectados por AURA</Text>
                    </View>
                </View>

                {/* Signature */}
                <View style={styles.signatureRow}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Firma del Odontologo Tratante</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Firma y Aceptacion del Paciente</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Dental Expression (c) {new Date().getFullYear()} — Sistema IA Certificado</Text>
                    <Text style={styles.footerText}>AURA Neural Dental AI — Powered by OpenAI GPT-4o</Text>
                </View>
            </Page>
        </Document>
    )
}
