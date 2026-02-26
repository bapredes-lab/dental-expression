import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, GripVertical, Trash2, FileDown } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TreatmentPlanPDF } from '@/components/admin/TreatmentPDF'

interface Procedure {
    id: string;
    name: string;
    time: string;
    cost: number;
}

export default function TreatmentPlanBuilder() {
    const [diagnosis, setDiagnosis] = useState('')
    const [procedures, setProcedures] = useState<Procedure[]>([
        { id: '1', name: 'Limpieza Profunda', time: '45 min', cost: 50 },
        { id: '2', name: 'Resina Simple', time: '30 min', cost: 40 }
    ])
    const [newProcName, setNewProcName] = useState('')
    const [newProcTime, setNewProcTime] = useState('')
    const [newProcCost, setNewProcCost] = useState('')

    const handleDragEnd = (result: any) => {
        if (!result.destination) return
        const items = Array.from(procedures)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)
        setProcedures(items)
    }

    const addProcedure = () => {
        if (!newProcName) return
        const newProcedure: Procedure = {
            id: Math.random().toString(36).substr(2, 9),
            name: newProcName,
            time: newProcTime || '30 min',
            cost: Number(newProcCost) || 0
        }
        setProcedures([...procedures, newProcedure])
        setNewProcName('')
        setNewProcTime('')
        setNewProcCost('')
    }

    const removeProcedure = (id: string) => {
        setProcedures(procedures.filter(p => p.id !== id))
    }

    const totalCost = procedures.reduce((acc, curr) => acc + curr.cost, 0)

    // Mock patient data
    const mockPatient = { nombre: 'María González', documento_numero: '1098273645' }

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Plan de Tratamiento</h2>
                    <p className="text-sm text-muted-foreground mt-1">Arma el plan arrastrando procedimientos y genera el presupuesto PDF.</p>
                </div>

                {/* PDF GENERATION BUTTON */}
                <PDFDownloadLink
                    document={<TreatmentPlanPDF patient={mockPatient} diagnosis={diagnosis} procedures={procedures} totalCost={totalCost} />}
                    fileName="Plan_De_Tratamiento_DentalExpression.pdf"
                >
                    {({ loading }) => (
                        <Button variant="default" className="bg-secondary hover:bg-secondary/90" disabled={loading}>
                            <FileDown className="mr-2 h-4 w-4" />
                            {loading ? 'Generando PDF...' : 'Generar PDF'}
                        </Button>
                    )}
                </PDFDownloadLink>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* BUILDER SIDE */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <Label htmlFor="diagnosis" className="text-base font-semibold text-primary">Diagnóstico Principal</Label>
                        <Textarea
                            id="diagnosis"
                            className="mt-2"
                            placeholder="Escribe el diagnóstico completo de la boca del paciente..."
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold text-primary border-b pb-2">Organizar Procedimientos</h3>

                        {/* DRAG AND DROP LIST */}
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="procedures">
                                {(provided) => (
                                    <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                        {procedures.map((proc, index) => (
                                            <Draggable key={proc.id} draggableId={proc.id} index={index}>
                                                {(provided) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className="flex items-center gap-3 p-3 bg-gray-50 border rounded-md"
                                                    >
                                                        <div {...provided.dragHandleProps} className="cursor-grab hover:text-primary">
                                                            <GripVertical className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                                                            <div className="col-span-6 font-medium text-sm">{proc.name}</div>
                                                            <div className="col-span-3 text-sm text-gray-500">{proc.time}</div>
                                                            <div className="col-span-3 text-sm font-semibold text-right">${proc.cost.toFixed(2)}</div>
                                                        </div>
                                                        <button onClick={() => removeProcedure(proc.id)} className="text-gray-400 hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>

                {/* INPUTS AND TOTALS SIDE */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-primary mb-4">Añadir Procedimiento</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="procName">Nombre</Label>
                                <Input id="procName" value={newProcName} onChange={(e) => setNewProcName(e.target.value)} placeholder="Ej. Ortodoncia (Ajuste)" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="procTime">Tiempo</Label>
                                    <Input id="procTime" value={newProcTime} onChange={(e) => setNewProcTime(e.target.value)} placeholder="Ej. 1 hora" />
                                </div>
                                <div>
                                    <Label htmlFor="procCost">Costo ($)</Label>
                                    <Input id="procCost" type="number" value={newProcCost} onChange={(e) => setNewProcCost(e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                            <Button className="w-full mt-2" variant="outline" onClick={addProcedure}>
                                <Plus className="mr-2 h-4 w-4" /> Añadir a la lista
                            </Button>
                        </div>
                    </div>

                    <div className="bg-primary text-white p-6 rounded-xl shadow-md">
                        <p className="text-primary-foreground text-sm font-medium mb-1">Presupuesto Estimado</p>
                        <h4 className="text-4xl font-bold">${totalCost.toFixed(2)}</h4>
                        <p className="text-xs text-primary-foreground/80 mt-2">Los montos se calculan y cobran en USD (Dólares Americanos).</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
