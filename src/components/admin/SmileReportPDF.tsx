import { Document, Page, Image, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: { padding: 50, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 30, paddingBottom: 20, borderBottom: '2pt solid #052c46',
    },
    brandTitle: { fontSize: 22, fontWeight: 'bold', color: '#052c46' },
    brandSubtitle: { fontSize: 9, color: '#10b981', marginTop: 4 },
    headerRightText: { fontSize: 9, color: '#64748b', marginTop: 2, textAlign: 'right' },
    sectionTitle: {
        fontSize: 11, fontWeight: 'bold', color: '#052c46',
        marginBottom: 8, paddingBottom: 5, borderBottom: '0.5pt solid #e2e8f0',
    },
    imagesRow: { flexDirection: 'row', marginBottom: 25 },
    imageBoxLeft: { flex: 1, marginRight: 12 },
    imageBoxRight: { flex: 1 },
    imageLabel: {
        fontSize: 8, fontWeight: 'bold', color: '#64748b',
        marginBottom: 6, textAlign: 'center', textTransform: 'uppercase',
    },
    imageLabelAfter: {
        fontSize: 8, fontWeight: 'bold', color: '#10b981',
        marginBottom: 6, textAlign: 'center', textTransform: 'uppercase',
    },
    image: { width: '100%', borderRadius: 6 },
    section: { marginBottom: 20 },
    bodyText: { fontSize: 9, color: '#475569', lineHeight: 1.6, marginBottom: 4 },
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

interface SmileReportProps {
    beforeImage: string
    afterImage: string
}

export function SmileReportPDF({ beforeImage, afterImage }: SmileReportProps) {
    const today = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })

    return (
        <Document title="Reporte Diseno de Sonrisa — Dental Expression">
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.brandTitle}>Dental Expression</Text>
                        <Text style={styles.brandSubtitle}>Neural Smile Designer — DALL-E 3 AI</Text>
                    </View>
                    <View>
                        <Text style={styles.headerRightText}>Reporte de Diseno de Sonrisa</Text>
                        <Text style={styles.headerRightText}>Fecha: {today}</Text>
                    </View>
                </View>

                {/* Before / After Images */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Simulacion Visual — Antes y Despues</Text>
                    <View style={styles.imagesRow}>
                        <View style={styles.imageBoxLeft}>
                            <Text style={styles.imageLabel}>Antes (Fotografia Original)</Text>
                            <Image src={beforeImage} style={styles.image} />
                        </View>
                        <View style={styles.imageBoxRight}>
                            <Text style={styles.imageLabelAfter}>Despues (Diseno IA)</Text>
                            <Image src={afterImage} style={styles.image} />
                        </View>
                    </View>
                </View>

                {/* AI Analysis */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Analisis Neural AURA</Text>
                    <Text style={styles.bodyText}>
                        La inteligencia artificial analizo las proporciones aureas faciales del paciente, calculo el eje
                        de los caninos y diseno una arquitectura dental optima basada en los estandares de la guia VITA (tono A1/B1).
                        La simulacion fue procesada con tecnologia DALL-E 3 en resolucion HD, garantizando un resultado
                        hiper-realista de la rehabilitacion estetica propuesta.
                    </Text>
                </View>

                {/* Proposed Treatments */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tratamientos Propuestos</Text>
                    <Text style={styles.bodyText}>- Diseno de Sonrisa Digital con carillas de porcelana de ultima generacion.</Text>
                    <Text style={styles.bodyText}>- Correccion de simetria gingival para arquitectura dental ideal.</Text>
                    <Text style={styles.bodyText}>- Blanqueamiento profesional de alta concentracion (tono objetivo: A1 VITA).</Text>
                    <Text style={styles.bodyText}>- Ajuste oclusal y tallado minimamente invasivo de piezas anteriores.</Text>
                </View>

                {/* Signature */}
                <View style={styles.signatureRow}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Firma del Odontologo Tratante</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Firma y Aprobacion del Paciente</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Dental Expression (c) {new Date().getFullYear()} — Sistema IA Certificado</Text>
                    <Text style={styles.footerText}>AURA Neural Smile Designer — Powered by OpenAI DALL-E 3</Text>
                </View>
            </Page>
        </Document>
    )
}
