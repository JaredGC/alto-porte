// Este componente fue generado por IA, prompt: Make a modal with a form with this data: CreateLeadDto, use Formik and yup.
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type { CreateLeadDto } from "../interfaces";
import { leadValidationSchema } from "../constants";

export const CreateLeadForm = ({ onSubmit }: { onSubmit: (values: CreateLeadDto) => void }) => {
    const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
    return (<>
        <button
            type="button"
            onClick={() => setIsNewLeadModalOpen(true)}
            className="bg-(--gray-2) text-white px-4 rounded-lg hover:bg-white hover:text-(--gray-2) hover:border hover:border-(--gray-2) transition cursor-pointer"
        >
            Nuevo Lead
        </button>
        {isNewLeadModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Nuevo Lead</h2>
                        <button
                            type="button"
                            onClick={() => setIsNewLeadModalOpen(false)}
                            className="cursor-pointer text-xl text-(--gray-2)"
                            aria-label="Cerrar modal"
                        >
                            ×
                        </button>
                    </div>
                    <Formik
                        initialValues={{ name: '', email: '', phone: '', source: '', budget: 0, project: '' }}
                        validationSchema={leadValidationSchema}
                        onSubmit={(values) => {
                            onSubmit(values);
                            setIsNewLeadModalOpen(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="grid gap-4">
                                <label className="grid gap-1 text-sm">Nombre
                                    <Field name="name" className="rounded border border-(--gray-3) px-3 py-2" />
                                    <ErrorMessage name="name" component="span" className="text-xs text-red-600" />
                                </label>
                                <label className="grid gap-1 text-sm">Correo electrónico
                                    <Field name="email" type="email" className="rounded border border-(--gray-3) px-3 py-2" />
                                    <ErrorMessage name="email" component="span" className="text-xs text-red-600" />
                                </label>
                                <label className="grid gap-1 text-sm">Teléfono
                                    <Field name="phone" className="rounded border border-(--gray-3) px-3 py-2" />
                                    <ErrorMessage name="phone" component="span" className="text-xs text-red-600" />
                                </label>
                                <label className="grid gap-1 text-sm">Fuente
                                    <Field name="source" className="rounded border border-(--gray-3) px-3 py-2" />
                                    <ErrorMessage name="source" component="span" className="text-xs text-red-600" />
                                </label>
                                <label className="grid gap-1 text-sm">Presupuesto
                                    <Field name="budget" type="number" min="0" className="rounded border border-(--gray-3) px-3 py-2" />
                                    <ErrorMessage name="budget" component="span" className="text-xs text-red-600" />
                                </label>
                                <label className="grid gap-1 text-sm">Proyecto
                                    <Field name="project" className="rounded border border-(--gray-3) px-3 py-2" />
                                    <ErrorMessage name="project" component="span" className="text-xs text-red-600" />
                                </label>
                                <div className="mt-2 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsNewLeadModalOpen(false)} className="cursor-pointer rounded-lg px-4 py-2 border border-(--gray-2)">Cancelar</button>
                                    <button type="submit" disabled={isSubmitting} className="cursor-pointer rounded-lg bg-(--gray-2) px-4 py-2 text-white">Guardar</button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        )}
    </>)
};