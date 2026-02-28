import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    User,
    Calendar,
    FileText,
    Activity,
    History,
    Plus,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import SmartOdontogram from '@/components/admin/SmartOdontogram';

export default function PatientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            fetchPatientData();
        }
    }, [id]);

    const fetchPatientData = async () => {
        setLoading(true);
        try {
            // 1. Datos básicos del paciente
            const { data: patientData, error: pError } = await supabase
                .from('patients')
                .select('*')
                .eq('id', id)
                .single();

            if (pError) throw pError;
            setPatient(patientData);

            // 2. Historial de citas (Buscando en la tabla 'consultas' por email o nombre)
            // Nota: Intentamos por email primero, que es más preciso.
            if (patientData.email) {
                const { data: apptsData, error: aError } = await supabase
                    .from('consultas')
                    .select('*')
                    .eq('paciente_email', patientData.email)
                    .order('fecha_hora', { ascending: false });

                if (aError) console.error("Error historial consultas:", aError);
                setAppointments(apptsData || []);
            }

        } catch (error) {
            console.error("Error al cargar paciente:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando Historia Clínica...</p>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-slate-800">Paciente no encontrado</h3>
                <Button onClick={() => navigate('/admin/patients')} className="mt-4">Volver al listado</Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-20"
        >
            {/* Header / Perfil Rápido */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-xl luxury-shadow">
                <div className="flex items-center gap-6">
                    <Button variant="outline" size="icon" onClick={() => navigate('/admin/patients')} className="rounded-2xl border-slate-200">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-[#052c46] to-[#0A3D62] flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                        {patient.name ? patient.name[0] : 'P'}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-[#052c46] tracking-tighter">{patient.name}</h2>
                        <div className="flex items-center gap-4 mt-1 text-sm font-bold text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><User className="w-4 h-4" /> ID: {patient.id.substring(0, 8)}</span>
                            <span className="text-emerald-500">● Paciente Activo</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => window.location.href = '/admin/agenda'}
                        className="rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] px-6 h-12 shadow-lg shadow-emerald-500/20"
                    >
                        <Calendar className="mr-2 h-4 w-4" /> Agendar Cita
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-white/50 backdrop-blur p-1 rounded-2xl border border-white/50 h-14">
                    <TabsTrigger value="overview" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px]">Resumen Médico</TabsTrigger>
                    <TabsTrigger value="odontogram" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px]">Odontograma Real</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px]">Historial / Citas</TabsTrigger>
                    <TabsTrigger value="files" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px]">Galería Clínica</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Info de contacto */}
                            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl luxury-shadow">
                                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#0F4C75]" /> Datos de Contacto
                                </h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Principal</p>
                                        <p className="font-bold text-slate-700">{patient.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Teléfono Movil</p>
                                        <p className="font-bold text-slate-700">{patient.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dirección Residencial</p>
                                        <p className="font-bold text-slate-700">Calle 10 #43-21, Medellín</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha de Registro</p>
                                        <p className="font-bold text-slate-700">{new Date(patient.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar con alertas */}
                        <div className="space-y-6">
                            <div className="bg-red-900 rounded-[2.5rem] p-8 text-white luxury-shadow relative overflow-hidden group">
                                <Activity className="w-12 h-12 mb-6 text-red-400 opacity-20" />
                                <h4 className="text-xl font-black mb-2 tracking-tight">Alertas Médicas</h4>
                                <p className="text-sm font-bold text-red-200/60 mb-6 uppercase tracking-widest border-b border-red-800 pb-4">Importante</p>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <span className="h-2 w-2 bg-red-400 rounded-full mt-1.5" />
                                        <p className="text-sm font-medium text-red-100">Sin alergias reportadas hasta el momento.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="odontogram">
                    <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-4 lg:p-10 border border-white/50 shadow-2xl luxury-shadow min-h-[600px]">
                        <SmartOdontogram patientId={patient.id} patientName={patient.name} />
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl luxury-shadow">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <History className="w-6 h-6 text-emerald-500" /> Cronograma de Consultas
                            </h3>
                            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-[#0F4C75] rounded-xl">
                                Filtrar Por Año
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {appointments.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    No hay teleconsultas registradas para este email.
                                </div>
                            ) : (
                                appointments.map((appt, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-white/50 border border-slate-100 rounded-[1.5rem] hover:border-emerald-500/10 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="h-12 w-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center border border-slate-200">
                                                <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{new Date(appt.fecha_hora).toLocaleString('es-ES', { month: 'short' })}</span>
                                                <span className="text-lg font-black text-[#052c46] leading-none">{new Date(appt.fecha_hora).getDate()}</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 tracking-tight">{appt.motivo || 'Teleconsulta Virtual'}</p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(appt.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${appt.estado === 'pagada' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {appt.estado}
                                            </span>
                                            <Button
                                                onClick={() => navigate(`/admin/teleconsultas/${appt.id}`)}
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-xl hover:bg-emerald-50 text-emerald-600"
                                            >
                                                <ArrowLeft className="w-5 h-5 rotate-180" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="files">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <button className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group">
                            <Plus className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">Subir Media</span>
                        </button>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
