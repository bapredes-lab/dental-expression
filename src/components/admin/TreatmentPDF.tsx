import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Create styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: 1,
        borderColor: '#eee',
        paddingBottom: 10,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F4C75',
    },
    subtitle: {
        fontSize: 8,
        color: '#666',
    },
    patientInfo: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f8fafc',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 100,
        fontWeight: 'bold',
        color: '#0F4C75',
    },
    value: {
        flex: 1,
    },
    table: {
        display: 'flex',
        width: 'auto',
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#0F4C75',
        color: 'white',
        padding: 5,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: 1,
        borderColor: '#eee',
        padding: 5,
    },
    col1: { width: '10%' },
    col2: { width: '50%' },
    col3: { width: '20%', textAlign: 'right' },
    col4: { width: '20%', textAlign: 'right' },
    totalRow: {
        flexDirection: 'row',
        marginTop: 10,
        paddingTop: 10,
        borderTop: 2,
        borderColor: '#0F4C75',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#999',
        borderTop: 1,
        borderColor: '#eee',
        paddingTop: 10,
    },
    signatureBox: {
        marginTop: 40,
        width: 150,
        borderTop: 1,
        borderColor: '#000',
        textAlign: 'center',
        paddingTop: 5,
    }
})

interface Procedure {
    id: string;
    name: string;
    time: string;
    cost: number;
}

interface TreatmentPlanPDFProps {
    patient: any;
    diagnosis: string;
    procedures: Procedure[];
    totalCost: number;
}

export const TreatmentPlanPDF = ({ patient, diagnosis, procedures, totalCost }: TreatmentPlanPDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.logoSection}>
                    <Image src="/logo.jpg" style={styles.logo} />
                    <View>
                        <Text style={styles.title}>DENTAL EXPRESSION</Text>
                        <Text style={styles.subtitle}>Especialistas en Sonrisas</Text>
                    </View>
                </View>
                <View style={{ textAlign: 'right' }}>
                    <Text>Fecha: {new Date().toLocaleDateString()}</Text>
                    <Text>Plan #: {Math.floor(Math.random() * 1000)}</Text>
                </View>
            </View>

            {/* PATIENT INFO */}
            <View style={styles.patientInfo}>
                <View style={styles.row}>
                    <Text style={styles.label}>Paciente:</Text>
                    <Text style={styles.value}>{patient?.nombre || 'Paciente de Prueba'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Documento:</Text>
                    <Text style={styles.value}>{patient?.documento_numero || '123456789'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Diagnóstico:</Text>
                    <Text style={styles.value}>{diagnosis || 'Diagnóstico no especificado'}</Text>
                </View>
            </View>

            {/* PROCEDURES TABLE */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.col1}>Paso</Text>
                    <Text style={styles.col2}>Procedimiento</Text>
                    <Text style={styles.col3}>Tiempo Est.</Text>
                    <Text style={styles.col4}>Costo (USD)</Text>
                </View>

                {procedures.map((proc, index) => (
                    <View key={proc.id} style={styles.tableRow}>
                        <Text style={styles.col1}>{index + 1}</Text>
                        <Text style={styles.col2}>{proc.name}</Text>
                        <Text style={styles.col3}>{proc.time}</Text>
                        <Text style={styles.col4}>${proc.cost.toFixed(2)}</Text>
                    </View>
                ))}

                <View style={styles.totalRow}>
                    <Text style={{ width: '80%', textAlign: 'right', fontWeight: 'bold', color: '#0F4C75' }}>Total Estimado:</Text>
                    <Text style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>${totalCost.toFixed(2)}</Text>
                </View>
            </View>

            {/* SIGNATURE */}
            <View style={styles.signatureBox}>
                <Text>Firma del Odontólogo Tratante</Text>
            </View>

            {/* FOOTER */}
            <Text style={styles.footer} fixed>
                Este documento es un estimado del plan de tratamiento y sus costos pueden variar según la evaluación clínica continua.
                Válido por 30 días.
            </Text>
        </Page>
    </Document>
)
