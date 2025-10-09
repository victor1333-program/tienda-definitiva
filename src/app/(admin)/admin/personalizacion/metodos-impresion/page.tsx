'use client';

import { useState, useEffect } from 'react';
import { Plus, Settings, Trash2, Edit3, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface PrintingMethod {
  id: string;
  name: string;
  isActive: boolean;
  outputFormat: string;
  dpi: number;
  allowText: boolean;
  allowUserUploads: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PrintingMethodsPage() {
  const [printingMethods, setPrintingMethods] = useState<PrintingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrintingMethods();
  }, []);

  const fetchPrintingMethods = async () => {
    try {
      const response = await fetch('/api/printing-methods');
      if (response.ok) {
        const data = await response.json();
        setPrintingMethods(data);
      }
    } catch (error) {
      console.error('Error fetching printing methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este método de impresión?')) {
      try {
        const response = await fetch(`/api/printing-methods/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchPrintingMethods();
        }
      } catch (error) {
        console.error('Error deleting printing method:', error);
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/printing-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (response.ok) {
        fetchPrintingMethods();
      }
    } catch (error) {
      console.error('Error updating printing method:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métodos de Impresión</h1>
          <p className="text-gray-600 mt-2">
            Aquí, puede crear un método de impresión y personalizar la configuración tanto para sus
            archivos listos para imprimir como para las herramientas de personalización de sus productos
          </p>
        </div>
        <Link
          href="/admin/personalizacion/metodos-impresion/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Añadir método de impresión
        </Link>
      </div>

      {/* Métodos de impresión */}
      {printingMethods.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay métodos de impresión</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comience creando su primer método de impresión.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/personalizacion/metodos-impresion/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Nuevo método de impresión
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {printingMethods.map((method) => (
            <div
              key={method.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header de la tarjeta */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{method.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      method.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {method.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Configuración resumida */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Formato:</span>
                  <span className="font-medium">{method.outputFormat}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">DPI:</span>
                  <span className="font-medium">{method.dpi}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Texto:</span>
                  <span className={`font-medium ${method.allowText ? 'text-green-600' : 'text-red-600'}`}>
                    {method.allowText ? 'Permitido' : 'No permitido'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subida de archivos:</span>
                  <span className={`font-medium ${method.allowUserUploads ? 'text-green-600' : 'text-red-600'}`}>
                    {method.allowUserUploads ? 'Permitido' : 'No permitido'}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/personalizacion/metodos-impresion/${method.id}/edit`}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </Link>
                <button
                  onClick={() => toggleActive(method.id, method.isActive)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    method.isActive
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                >
                  {method.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}